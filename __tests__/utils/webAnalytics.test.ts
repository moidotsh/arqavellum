// __tests__/utils/webAnalytics.test.ts
// Goldens for the visit-source classifier (QR / typed / linked / PWA)
// and the report-once-per-session guard.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  classifyVisitSource,
  visitEventName,
  reportVisitSource,
  initWebAnalytics,
  type VisitSourceFacts,
} from '../../utils/webAnalytics';

const facts = (over: Partial<VisitSourceFacts> = {}): VisitSourceFacts => ({
  path: '/',
  referrer: '',
  standalone: false,
  origin: 'https://example.com',
  ...over,
});

describe('classifyVisitSource', () => {
  it('a /qr landing (trailing slash tolerated) is a printed-code scan', () => {
    expect(classifyVisitSource(facts({ path: '/qr' }))).toBe('qr');
    expect(classifyVisitSource(facts({ path: '/qr/' }))).toBe('qr');
  });

  it('standalone launches are pwa — they carry no referrer', () => {
    expect(classifyVisitSource(facts({ standalone: true }))).toBe('pwa');
  });

  it('cross-origin referrers are links; same-origin are internal', () => {
    expect(classifyVisitSource(facts({ referrer: 'https://t.co/x' }))).toBe('link');
    expect(
      classifyVisitSource(facts({ referrer: 'https://example.com/settings', path: '/settings' })),
    ).toBe('internal');
  });

  it('no referrer is direct — typed, bookmarked, or referrer-stripped shares', () => {
    expect(classifyVisitSource(facts())).toBe('direct');
  });

  it('an unparseable referrer reads direct, never throws', () => {
    expect(classifyVisitSource(facts({ referrer: 'not-a-url' }))).toBe('direct');
  });
});

describe('reportVisitSource', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.va = vi.fn();
    window.vaq = [];
  });
  afterEach(() => {
    delete window.va;
    delete window.vaq;
    window.sessionStorage.clear();
  });

  it('fires one channel event with the landing path, once per session', () => {
    reportVisitSource(facts({ path: '/qr' }));
    expect(window.va).toHaveBeenCalledWith('event', { name: 'visit_qr', path: '/qr' });
    // The root layout's report for the same session is a no-op.
    reportVisitSource(facts({ path: '/' }));
    expect(window.va).toHaveBeenCalledTimes(1);
  });

  it('carries the referrer host (not the full URL) for linked visits', () => {
    reportVisitSource(facts({ referrer: 'https://www.instagram.com/story' }));
    expect(window.va).toHaveBeenCalledWith('event', {
      name: 'visit_link',
      path: '/',
      referrer: 'www.instagram.com',
    });
  });

  it('re-reports in a new session', () => {
    reportVisitSource(facts());
    window.sessionStorage.clear();
    reportVisitSource(facts());
    expect(window.va).toHaveBeenCalledTimes(2);
  });

  it('event names map 1:1 to channels', () => {
    expect(
      (['qr', 'pwa', 'link', 'direct', 'internal'] as const).map(visitEventName),
    ).toEqual(['visit_qr', 'visit_pwa', 'visit_link', 'visit_direct', 'visit_internal']);
  });

  it('dev/test never injects the script tag', () => {
    initWebAnalytics();
    expect(document.querySelector('script[src*="_vercel/insights"]')).toBeNull();
  });
});
