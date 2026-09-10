// utils/webAnalytics.ts
//
// Vercel Web Analytics seam — the official no-framework injection,
// hand-rolled instead of @vercel/analytics so the RN-Web static-export
// bundle takes no new dependency and Metro never resolves a DOM-only
// package. The contract is three lines (Vercel's quickstart for
// non-framework sites): a window.va queue stub, the script tag at
// /_vercel/insights/script.js (served by the platform once Web
// Analytics is enabled for the project in the Vercel dashboard), and
// window.va('event', {...}) for custom events. Pageviews — including
// SPA route changes — are tracked by the script itself.
//
// The seam ships DISABLED BY DEFAULT (invariant 13): the consumer
// sets EXPO_PUBLIC_WEB_ANALYTICS=1 to gate the script injection in
// app/_layout.tsx. Classification always runs — it is local-only, and
// events queue and go nowhere unless the script loads.
//
// Visit sources. The dashboard natively splits referrers ("linked
// from X" vs Direct), but a QR scan and a typed URL BOTH arrive with
// no referrer. The discriminator is the landing path: printed QR
// codes encode https://<consumer-domain>/qr — keep that URL at or
// under QR version 1-L's byte-mode capacity (17 bytes) so the printed
// code stays the smallest scannable grid (no room for parameters,
// ever — one more character errors the encoder). app/qr.tsx lands
// those scanners and hands them to the home screen; the visit is
// classified 'qr' here.
//
// Native: every entry point no-ops (no window). Dev: the script is
// never injected (it 404s off-Vercel and only reports in production);
// queued events go nowhere, harmless.

import { isWeb, hasDocument, hasWindow } from './platform';

declare global {
  interface Window {
    /** Vercel Web Analytics endpoint — the stub below until the script loads. */
    va?: (...args: unknown[]) => void;
    /** Events queued before the script loads; drained by the script. */
    vaq?: unknown[][];
  }
}

const INSIGHTS_SCRIPT_SRC = '/_vercel/insights/script.js';

/** The printed-QR landing path — see the header before ever changing it. */
export const QR_LANDING_PATH = '/qr';

const VISIT_REPORTED_KEY = 'arqavellum-visit-source';

export type VisitChannel = 'qr' | 'pwa' | 'link' | 'direct' | 'internal';

/** Inputs to classification — plain facts so the mapping is testable. */
export interface VisitSourceFacts {
  path: string;
  referrer: string;
  standalone: boolean;
  origin: string;
}

/**
 * Map the entry facts to one channel:
 *   qr       — landed on /qr (a printed code was scanned)
 *   pwa      — launched from the home screen (standalone display mode;
 *              no referrer, would otherwise read direct)
 *   link     — referred by another site
 *   internal — referred by this site (an in-app new tab)
 *   direct   — no referrer: typed, bookmarked, or a share from apps
 *              that strip referrers (SMS, most messengers)
 */
export function classifyVisitSource(facts: VisitSourceFacts): VisitChannel {
  const path = facts.path.replace(/\/+$/, '');
  if (path === QR_LANDING_PATH) return 'qr';
  if (facts.standalone) return 'pwa';
  if (!facts.referrer) return 'direct';
  try {
    return new URL(facts.referrer).origin === facts.origin ? 'internal' : 'link';
  } catch {
    return 'direct';
  }
}

/** Custom-event name for a channel — visit_qr, visit_direct, … */
export function visitEventName(channel: VisitChannel): string {
  return `visit_${channel}`;
}

/**
 * Install the queue stub. Idempotent, pure JS, safe in dev/test —
 * events fired before the script loads (or without it ever loading)
 * sit in window.vaq instead of throwing or vanishing.
 */
function ensureQueueStub(): void {
  if (window.va) return;
  window.va = (...args: unknown[]) => {
    (window.vaq ??= []).push(args);
  };
}

/**
 * Inject the official snippet: the queue stub, then the script tag
 * (mirroring @vercel/analytics' own duplicate guard). Web + production
 * only — elsewhere the script 404s and reports nothing.
 */
export function initWebAnalytics(): void {
  if (!isWeb || !hasWindow() || !hasDocument()) return;
  if (process.env.NODE_ENV !== 'production') return;
  ensureQueueStub();
  if (document.head.querySelector(`script[src*="${INSIGHTS_SCRIPT_SRC}"]`)) return;
  const script = document.createElement('script');
  script.src = INSIGHTS_SCRIPT_SRC;
  script.defer = true;
  document.head.appendChild(script);
}

/**
 * Queue a custom event. Data values must be flat primitives — the
 * Vercel payload rejects nested objects.
 */
export function trackWebEvent(
  name: string,
  data?: Record<string, string | number | boolean | null>,
): void {
  if (!hasWindow()) return;
  ensureQueueStub();
  window.va?.('event', { name, ...data });
}

/** Read the live entry facts off the current document. */
function readVisitFacts(): VisitSourceFacts {
  return {
    path: window.location.pathname,
    referrer: document.referrer,
    standalone: window.matchMedia?.('(display-mode: standalone)').matches ?? false,
    origin: window.location.origin,
  };
}

/**
 * Classify this browser session's entry and report it — once per
 * session. The sessionStorage flag keeps the /qr screen's report and
 * the root layout's report from double-counting (child effects run
 * before parent effects; either order reports exactly once). Facts may
 * be injected; the live document is the default.
 */
export function reportVisitSource(facts?: VisitSourceFacts): void {
  if (!isWeb || !hasWindow() || !hasDocument()) return;
  try {
    if (window.sessionStorage.getItem(VISIT_REPORTED_KEY)) return;
    window.sessionStorage.setItem(VISIT_REPORTED_KEY, '1');
  } catch {
    // Storage blocked (some private modes): report anyway — a
    // StrictMode double-mount may double-send; the dashboard copes.
  }
  const live = facts ?? readVisitFacts();
  const channel = classifyVisitSource(live);
  let referrerHost = '';
  try {
    referrerHost = new URL(live.referrer).hostname;
  } catch {
    referrerHost = '';
  }
  trackWebEvent(visitEventName(channel), {
    path: live.path,
    ...(referrerHost ? { referrer: referrerHost } : {}),
  });
}
