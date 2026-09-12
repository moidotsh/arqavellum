# Arqavellum

> Arqavellum is a clean, domain-agnostic PWA-first Expo+Tamagui+Supabase+Bun starter repo. It ships a 47-pattern constitution, 12-audit pre-commit gate, repository pattern, Zustand + React Query, and barrel exports — retuned for **light-default, dark-opt-in** + **PWA-first (native export is consumer extension)** + **email/password auth**. Consumers clone arqavellum, drop in their domain (products, sessions, records — whatever), override the `brand` color slot, ship.

This file is the repo-level operating context for Claude Code sessions at the arqavellum root. It auto-loads. Read the relevant section before landing any arqavellum change.

## Invariants

Load-bearing rules that aren't obvious from the code:

1. **Bun only.** Never commit `package-lock.json` or `yarn.lock`. `audit-pattern-compliance.ts` (S19) enforces this.
2. **PWA-first. Web is the supported default; native Expo export is an intentional consumer extension, with native assets and platform validation required before release.** Native scaffolding ships in `app.config.ts` (`icon`, `ios`, `android`, `expo-splash-screen` plugin) + 3 placeholder PNGs at `./assets/` (icon.png, splash-icon.png, adaptive-icon.png). `app.json` mirrors `app.config.ts` as a synchronized template; `app.config.ts` is the build-authoritative source. `ios.bundleIdentifier: 'app.arqavellum'` is starter scaffolding — a consumer going native replaces it with their own iOS bundle ID and adds their own Android application/package ID before any native release. Runtime manifest-injection in `app/_layout.tsx` remains load-bearing — Expo Web's static export strips `<link rel="manifest">` from `dist/index.html` — and delivery is now two-layer: `scripts/inject-critical-web.ts` (chained into `build:web`/`vercel-build`) copies the PWA tags, the id'd `<style>` blocks, and any font preloads from `index.html` into every exported route at build time, and the runtime injection covers dev + any path the export strip still misses. Don't remove either without reading `docs/architecture/pwa-installability.md` first. Desktop-shaped layouts (multi-column, sidebar nav) are a consumer extension that adds a sibling `DesktopPremium` kit — see `docs/contributing.md` → "Adding desktop support". PWA-first forbids shipping a native build as a supported target without per-consumer asset + platform work; it does NOT forbid desktop browser layouts.
3. **Light is the default; dark is opt-in.** `constants/theme.ts` ships both `theme.colors.light` and `theme.colors.dark` — structurally identical palettes, retuned for their respective surfaces. The active palette is resolved at runtime by `useAppTheme()` (in `context/ThemeContext.tsx`); consumers read `colors.*` directly and never index by mode. The user's preference persists across sessions via `zustandStorage` (web localStorage / native AsyncStorage), with `'system'` as the default (defers to OS prefers-color-scheme). `audit-ui-theme.ts` (S7) bans hardcoded hex colors — both modes resolve through `theme.colors[colorScheme].*`. Adding a third mode (e.g. `dim`) is a deliberate consumer extension that requires retuning every MobilePremium primitive.
4. **Email/password auth by default.** Arqavellum ships no PIN primitives (`MobilePinInput`, `MobileFullPagePinEntry`, `MobilePinReauthSheet`, `_PinKeypad`) and no `audit-rpc-auth.ts` (the R1 RPC `verify_session` audit). A consumer needing PIN+device-UUID auth re-adds those four files + that one audit script as a customization — see "How to consume" below.
5. **The `brand` color slot is the single override point.** Arqavellum defaults to a neutral indigo (`#4F46E5`). Consumers override `theme.colors.light.brand` (and the related `brandHover` / `brandPress` / `brandMuted` / `brandSoft` / `buttonBackground` / `buttonBackgroundDisabled` keys). Don't introduce a second "accent" slot — every consumer wins from one canonical override. Shape has the same discipline: **`theme.shapes`** (surface / sheet / control / tile / tag) is the single shape-language override point, consumed by every kit primitive — a consumer retunes the family (e.g. sleek/monotone: `surface: 8, tag: 4`) without touching component files. Atmosphere too: **`theme.atmosphere`** (`style: 'aurora' | 'flat'`) is the single atmosphere-language override point — `'flat'` turns the drifting orbs off app-wide (base tint + vignette stay, every `MobileAtmosphere` including the nav drawer follows) with no per-callsite prop threading; `showOrbs` / `atmosphereShowOrbs` remain as explicit per-callsite overrides for the showcase.
6. **Audit scripts are canonical.** If this file and `scripts/audit-*.ts` disagree, the scripts win. This file is a cheatsheet; the scripts are the load-bearing enforcement.
7. **The 490px height-budget test** carries over. Any new MobilePremium screen must fit at 490px viewport height (iPhone SE compact) without scrolling for the primary action. See `docs/architecture/mobile-premium-design-system.md`.
8. **Stories system is deliberately absent.** Per Open Question 4 in the original arqavellum plan, the Stories tutorial system is skipped. A consumer wanting onboarding tutorials adds it as a customization.
9. **`vercel.json` ships in the repo** so consumers get a working first deploy without per-project Vercel dashboard config. Arqavellum's `package.json` only has `vercel-build` and `build:web` (no `build`), and Vercel's framework detection doesn't auto-pick `vercel-build` for an Expo Web static export — without this file, the first deploy fails with `Script not found "build"`. The file pins `buildCommand: bun run vercel-build`, `outputDirectory: dist`, the SPA catch-all rewrite (Expo Router static-export shape), and immutable-cache headers for `/_expo/static/*`, `/static/*`, and `*.css`. Consumers don't need to touch this unless they add function routes, cron jobs, or a different build pipeline.
10. **RPC-outcome telemetry ships disabled by default.** Arqavellum ships the full system — the `withRpcTelemetry(rpc, actorId, fn)` wrapper (`utils/supabase/rpcTelemetry.ts`), the edge function (`supabase/functions/track-rpc/index.ts`), and the table (`supabase/migrations/00000000000000_rpc_telemetry.sql`) — but the edge function ships with an EMPTY allowlist. Consumers deploy the migration + edge function and add allowlist entries as they wrap repository methods. Until entries are added, every telemetry POST silently 400s (the wrapper swallows the failure). See "Enabling RPC telemetry" below for the deploy + allowlist-sync steps.
11. **"Copy for AI" is a dev helper, not a runtime screen surface.** The shell ships three primitives: a pure formatter (`utils/buildAiPayload.ts`), a clipboard+toast+logger hook (`hooks/useCopyForAi.ts`), and a button (`components/MobilePremium/CopyForAiButton.tsx`) that fits the new `MobileHeader.navRightAction` slot or the existing `MobileHomeHeader.rightAction` slot. The hook re-uses `expo-clipboard` and `emitToast` — no new clipboard code per consumer. `navigation/routeMetadata.ts` is the consumer-extension seam: an empty path → `{ title?, contextLabel? }` registry that drives payload titles. The shell ships it EMPTY; armandotfit and every future consumer fill it in the same change that wires the button into their screens. The payload formatter NEVER adds anything the caller did not pass in — no env vars, tokens, hidden state. Auth routes should opt OUT (no useful screen content + risk of surfacing field labels in pasted payloads). The showcase (`app/dev/premium.tsx`) demos both variants — load-bearing, the showcase IS the visual source of truth (in dev; production exports resolve `app/dev/*` to an empty stub — see the pre-commit section's build plumbing).
12. **`startRealtimeTable` is the realtime table seam.** `utils/supabase/realtimeTable.ts` — one tail read (`hydrateLimit`, default 100; `0` skips) plus one postgres_changes INSERT stream, mapped through a consumer-owned pure `mapRow`; hydration is delivered oldest-first. Returns the paired stopper (idempotent — the channel-side R4a). No env gating: deciding when a realtime surface runs (configured, simulated, off) is a consumer decision. The subscriber's own writes echo back through the channel — dedupe by primary key in the consumer's store, not here. Errors degrade to `logger.warn('data', ...)`; a failed hydration or channel never throws into the caller.

13. **Web analytics is a disabled-by-default seam; `/qr` is the printed-QR landing route.** `utils/webAnalytics.ts` is the official no-framework Vercel Web Analytics snippet — a `window.va`/`vaq` queue stub plus the `/_vercel/insights/script.js` tag injected from the root layout's third web-only effect — deliberately NOT the `@vercel/analytics` package (Metro never resolves a DOM-only dependency; the shell adds no dependency). The seam ships DISABLED: `EXPO_PUBLIC_WEB_ANALYTICS=1` (consumer env) gates BOTH script injections — Web Analytics AND Speed Insights (`initSpeedInsights`: a `window.si`/`siq` queue stub plus its own `/_vercel/speed-insights/script.js` tag with `data-sdkn`/`data-sdkv`, hand-rolled to mirror @vercel/speed-insights@2.0.0's generic inject — the npm package and its DOM-only deps never enter the bundle; the consumer must also enable the products in the Vercel dashboard); visit-source classification (`qr` > `pwa` > `link` > `internal` > `direct` — path, standalone display-mode, referrer origin) always runs locally and reports once per session (`arqavellum-visit-source` in sessionStorage). `app/qr.tsx` (sb1-exempt redirect stub, router-public) is the landing for printed QR codes: consumers print `https://<their-domain>/qr`, kept at or under QR version 1-L's byte-mode capacity (17 bytes — no parameters, ever; one more character errors the encoder and a denser grid scans worse). The qr screen reports before its redirect — child effects run before the root layout's, and the session flag makes either order report exactly once. Consumers enabling analytics must also enable Web Analytics in the Vercel dashboard and redeploy (until both, the script 404s — harmless; `/qr` pageviews and the Referrers "Direct" bucket read on any dashboard plan, `visit_*` custom events need Pro). Classifier goldens in `__tests__/utils/webAnalytics.test.ts`; the redirect smoke in `__tests__/navigation/qr.test.tsx`; `qr.html` is in `verify-web-build`'s required set.

## Pre-commit checks (read before committing)

Arqavellum has 12 structural audits + `tsc --noEmit` + structural ESLint that run on every `git commit` via `.husky/pre-commit`. Any failure blocks the commit. Run them on the working tree **before** staging:

    bun run lint:structure && bunx tsc --noEmit

**Canonical source:** `scripts/audit-*.ts`. If this section and the scripts disagree, the scripts win.

**The barrel shims are load-bearing build plumbing (perf):** metro.config.js resolves the exact specifiers `@tamagui/lucide-icons-2` and `date-fns` to `shims/*.js`, GENERATED by `scripts/sync-barrel-shims.ts` from the repo's actual imports (chained before every expo command; metro.config regenerates if missing). The CJS nuclear option (zustand's `import.meta`, see metro.config.js) defeats barrel tree-shaking — importing one icon pulls all 3520 (measured on this repo's export: 5.37MB → 3.91MB raw, −27%, for 27 icons), and importing a handful of date-fns functions pulled the whole library (another −156KB raw when shimmed). The shims are auto-synced, so adding an import just works; a typo'd name fails the sync loudly instead of shipping a blank glyph or a runtime undefined. **Adding a third barrel means adding its sync block to the script + its resolver entry + its regeneration check in the same change.** Production exports also resolve `app/dev/*` to an empty stub (`shims/dev-route-stub.tsx`) — deterministically: NODE_ENV at metro-config load time is NOT reliable across invocation styles, so the gate reads only `EXPO_PUBLIC_DEV_SURFACES=1`, and the `start`/`web` scripts set it (see package.json). The showcase is the visual source of truth in dev and never ships in a bundle; the route still registers and still exports its HTML file. A second stub resolves `@tamagui/helpers-icon` to `shims/helpers-icon.js` (passthrough `themed()`): the starter mounts NO TamaguiProvider — zero Tamagui components ship, MobilePremium themes itself, and every icon call site passes explicit `color`/`size`, so the whole Tamagui runtime (~0.8MB) leaves the bundle while icons render identically. Re-adding Tamagui means mounting the provider + config in `app/_layout.tsx` AND removing that redirect — see the shim file and the layout header comment.

### The two universal escape hatches

- **`// <check>-exempt`** — suppresses one violation within a 300-char lookback (e.g. `// s7-exempt`, `// c1-exempt`). Use sparingly with a justification; every rule exists because violations have bitten.
- **`git commit --no-verify`** — skips the hook entirely. Reserve for genuine emergencies.

### The 12 audits, in pre-commit order

| # | Script | Codes | Catches |
|---|--------|-------|---------|
| 1 | `audit-barrels.ts` | `[S5-internal]`, `[S5-external]` | Own-barrel imports (circular); direct-path imports when a barrel re-exports the symbol. Only audit with `--fix`. |
| 2 | `audit-data-layer.ts` | `[S9-import]`, `[S9-call]`, `[S13]`, `[D5]` | Direct `supabase.*` in `app/`/`hooks/`/`components/`/`context/`; inline `queryKey: [...]`; repository methods not returning `RepositoryResult<T>`. |
| 3 | `audit-state.ts` | `[D3]`, `[D10]` | `useMutation` not touching a cache primitive; Zustand stores missing the 5 `// SECTION:` markers. |
| 4 | `audit-security.ts` | `[S12]`, `[SE2]`, `[S10]` | Anchored regex `.test()` in client code; AsyncStorage imports outside the allowlist; `Alert.alert` with raw `error.message`. |
| 5 | `audit-logging-errors.ts` | `[S11]`, `[S10]` | Live `console.*`; raw `throw new Error(...)` outside the carve-out. |
| 6 | `audit-ui-theme.ts` | `[S7]`, `[C3]` | Hardcoded hex colors; `Dimensions.get('window'/'screen')`. **Critical for light-mode enforcement.** |
| 7 | `audit-component-quality.ts` | `[C1]`, `[C2]`, `[C4]` | Direct `router.push/replace/back`; RN `Modal`; `ActivityIndicator` outside loading primitives. |
| 8 | `audit-testing-types.ts` | `[D6]`, `[T1]`, `[T2]` | UI code importing raw `shared/types`; test files outside `__tests__/`; inline `vi.mock()`. |
| 9 | `audit-pattern-compliance.ts` | `[S19]`, `[C10]` | `package-lock.json`/`yarn.lock` in tree; imports of deprecated symbols. |
| 10 | `audit-runtime-resilience.ts` | `[R4a]`, `[R4b]`, `[R1]` | `setInterval` without `clearInterval`; `addEventListener` without `removeEventListener`; async `useEffect` that awaits then setState/navigates without a cancellation guard. |
| 11 | `audit-screen-body.ts` | `[SB1]` | Full-screen route in `app/` (excluding `_layout.tsx`, `+not-found.tsx`, `dev/`) missing `SCREEN_BODY_STYLE` (composing `ScreenScaffold` from `components/composed/` satisfies SB1 by delegation — the scaffold applies the policy centrally). Suppress with `// sb1-exempt`. Skipped when `CONTENT_WIDTH_MODE = 'fluid'`. |
| 12 | `audit-mobile-content-width.ts` | `[SB2-portal]`, `[SB2-magic-number]`, `[SB2-surface]` | Portal component (imports RN `Modal` under `components/`) missing `...MOBILE_CONTENT_WIDTH_STYLE` / `...MOBILE_DIALOG_WIDTH_STYLE` spread on its panel style entry; literal numeric `maxWidth` under `components/`; `MobileSurface` re-asserting the content-width policy (the surface fills its container — the column belongs to the scaffold body or the portal panel). Suppress with `// sb2-exempt`. Skipped when `CONTENT_WIDTH_MODE = 'fluid'`. |

Structural ESLint (`eslint.structure.config.js`) enforces two more:
- **`[S6]`** — `{expr && <Component/>}` render leak.
- **`[S8]`** — raw `fetch()`.

### The five that bite most often

1. **S5 barrels** — same-folder imports go to the relative source (`./Foo`); cross-folder imports go through the folder barrel. Run `bun run scripts/audit-barrels.ts --fix` to auto-rewrite.
2. **C1 router calls** — never call `router.push/replace/back` directly outside `navigation/NavigationHelper.tsx` (arqavellum ships this; consumers extend it) and `hooks/useAuthNavigation.ts`.
3. **S9 supabase** — never `import` from `@supabase/supabase-js` or call `supabase.from/auth/rpc/...` in `app/`, `hooks/`, `components/`, or `context/`. Go through `utils/supabase/*` or `services/*`.
4. **S7 hex colors** — never hardcode `'#4F46E5'` in component code. Pull from `theme.colors.light.*` via `useAppTheme()` or a `constants` import. SVG vectors and `constants/theme.ts` are exempt.
5. **S11 console** — never ship `console.log/error/warn`. Use `logger` from `utils/logger`. (`utils/logger.ts` is the only legitimate `console.*` site.)

### Content-width policy (`CONTENT_WIDTH_MODE`)

The constrained mobile content column is Arqavellum's current default layout policy, not a universal permanent rule. `CONTENT_WIDTH_MODE = 'constrained'` enables a shared screen-body and portal-panel width system enforced by SB1 and SB2. `CONTENT_WIDTH_MODE = 'fluid'` makes the consumer responsible for its responsive width strategy and intentionally skips only SB1/SB2 width checks.

- **Single source of truth:** `constants/styles.ts` → `CONTENT_WIDTH_MODE`. Runtime styles (`MOBILE_CONTENT_WIDTH_STYLE`, `MOBILE_DIALOG_WIDTH_STYLE`, `SCREEN_BODY_STYLE`) and the SB1 + SB2 audits all read this same binding. Flipping the constant flips both runtime and enforcement in lockstep.
- **Constrained (default):** screen bodies apply `SCREEN_BODY_STYLE`; portal panels (any `components/*.tsx` importing RN `Modal`) spread `...MOBILE_CONTENT_WIDTH_STYLE` or `...MOBILE_DIALOG_WIDTH_STYLE` inside a panel-named StyleSheet entry (`sheet` / `card` / `cardWrapper` / `dialog` / `panel`). SB1 and SB2 actively enforce.
- **Fluid:** SB1 and SB2 print an informational skip and exit 0. Other audits (C2 Modal safety, S7 theme, accessibility, reduced motion, …) remain active. Fluid mode is a repository-level architecture decision (a consumer adopting a real tablet/desktop layout strategy); it is NOT a per-component escape hatch.
- **When to flip:** when a consumer adopts a sibling `DesktopPremium` kit (see `docs/contributing.md` → "Adding desktop support") or otherwise owns a responsive width strategy that conflicts with the centered 420pt column. Don't flip for individual wide screens — use `// sb1-exempt` / `// sb2-exempt` sparingly for those.

## How to consume (start a new app from arqavellum)

This is the load-bearing consumer guide. Following these steps in order yields a working app in minutes.

1. **Clone + re-init git:**
   ```bash
   git clone github.com/moidotsh/arqavellum my-app
   cd my-app
   rm -rf .git
   git init
   ```
2. **Find-and-replace `arqavellum` → `my-app`** in:
   - `package.json` (`name`)
   - `app.config.ts` (`name`, `slug`, `scheme`)
   - `app.json` (`name`, `slug`, `bundleIdentifier`)
   - `public/manifest.json` (`name`, `short_name`)
   - This file (title + headings)
3. **Set up env:** copy `.env.local.example` → `.env.local`, fill in your Supabase URL + anon key.
4. **Replace icons (two surfaces):** `public/icons/*` (PWA, always required — 192.png, 512.png, 512-maskable.png) and `assets/*` (native extension — icon.png, splash-icon.png, adaptive-icon.png). Arqavellum ships neutral indigo placeholders for both; the consumer overrides with brand artwork. The `assets/*` PNGs only matter for a native build, but replacing them upfront is cheap. Before any native release also replace the `ios.bundleIdentifier: 'app.arqavellum'` starter value in `app.config.ts` + `app.json` with your own iOS bundle ID and add your Android application/package ID — `app.arqavellum` is starter scaffolding, not a consumer's release identity.
5. **Override the `brand` color slot** in `constants/theme.ts` → `theme.colors.light.brand` (and `brandHover`, `brandPress`, `brandMuted`, `brandSoft`, `buttonBackground`, `buttonBackgroundDisabled`), and the product NAME in `constants/displayName.ts` (`APP_DISPLAY_NAME`) — the auth footer, home placeholder, and PWA meta titles all read it.
6. **(Optional) customize the atmosphere language + palettes.** The background style is one declaration: `theme.atmosphere.style` in `constants/theme.ts` — `'aurora'` (default, drifting orbs) or `'flat'` (base tint + vignette only; every `MobileAtmosphere`, the nav drawer, and the auth screens follow with no per-callsite props). The 7 semantic surface palettes are domain-agnostic but a consumer may want different hues — edit `components/premium/shared/atmospherePalettes.ts` (copy-then-customize).
7. **Drop in domain code:**
   - Routes → `app/` (replace the placeholder `app/index.tsx`)
   - Stores → `stores/`
   - Repositories → `utils/supabase/repositories/`
   - Services → `services/`
   - React Query hooks → `hooks/queries/`, `hooks/mutations/`
   - Domain types → `shared/types/` (extend the existing barrel)
   - Components → `components/` (use primitives from `components/MobilePremium/`)
8. **Extend the navigation helper:** arqavellum ships `navigation/NavigationHelper.tsx` with a small route set (`NavigationPath` enum + `navigationHierarchy` map + `navigateTo*` / `replaceWith*` helpers). Audit C1 allows `router.push/replace/back` only here and in `hooks/useAuthNavigation.ts`. When you add domain routes:
   - Add their enum values to `NavigationPath`.
   - Record parent→child relationships in `navigationHierarchy` (drives `goBack(currentPath)` — falls back to root when no parent is recorded).
   - Add `navigateTo<Screen>()` (push — drill-in) and/or `replaceWith<Screen>()` (replace — redirect) helpers. The convention is load-bearing: `navigateTo` = add to back stack, `replaceWith` = redirect away.
   - Update the existing `app/{login,register,forgot-password}.tsx` callsites if you rename an arqavellum route.
9. **Extend loading primitives:** arqavellum ships `components/primitives/{LoadingSpinner,LoadingOverlay,AppLoading}.tsx`. Audit C4 expects `ActivityIndicator` to live only inside these three files. Add domain-specific loading wrappers as composed components that import these primitives — don't sprinkling `ActivityIndicator` directly into domain code.
10. **Verify:** `bun install && bun run web`. Visit `/dev/premium` to confirm the design system renders (every primitive, all 7 atmosphere palettes, every animation hook, the container-variant probe). Visit `/login`, `/register`, `/settings` to confirm the shell flows work.

### When to add PIN auth

If your consumer's threat model requires PIN+device-UUID auth (instead of email/password), re-add:

1. Four PIN primitives: `MobilePinInput.tsx`, `MobileFullPagePinEntry.tsx`, `MobilePinReauthSheet.tsx`, `_PinKeypad.tsx`.
2. An `audit-rpc-auth.ts` script (the R1 RPC `verify_session` audit) in `scripts/`.
3. A `verify_session` RPC migration in `supabase/migrations/`.
4. Update `.husky/pre-commit` and `package.json` → `lint:structure` to include `audit-rpc-auth.ts`.
5. Replace `utils/supabase/AuthService.ts` with a PIN-based equivalent.

## Enabling RPC telemetry

Arqavellum ships the full RPC-outcome telemetry stack but disabled by default. The system answers "did this RPC land?" and "if not, why?" without depending on a consent-gated analytics pipeline — pre-consent, ad-blocker-surviving, fire-and-forget. The shape:

- **Wrapper:** `utils/supabase/rpcTelemetry.ts` → `withRpcTelemetry(rpc, actorId, fn)`. Wraps a repository's `supabase.rpc(...)` call, captures outcome + duration, POSTs an event. Transparent to error handling (returns the original result; telemetry failures swallowed). `actorId` is intentionally generic — pass whatever stable identifier your domain uses (user_id, device_id, anonymous_id, null for pre-session calls).
- **Edge function:** `supabase/functions/track-rpc/index.ts`. Allowlist-based RPC validation, per-IP rate limit (60/min in-memory), coarse geo from IP, service-role insert. Fail-closed CORS.
- **Shared helpers:** `supabase/functions/_shared/{cors,supabase-client,geo-lookup}.ts`. Domain-agnostic infrastructure shared with any future edge function you add.
- **Table:** `supabase/migrations/00000000000000_rpc_telemetry.sql`. Deny-all RLS — only the service role (used by the edge function) can INSERT. Column `actor_id` is generic.

### Deploy (one-time, per Supabase project)

1. Apply the migration:
   ```
   bunx supabase db push
   ```
   Requires the project to be linked (`bunx supabase link --project-ref <ref>` — one-time per project). Or paste the SQL into the Supabase dashboard SQL editor. Either way, the `rpc_telemetry` table lands.
2. Deploy the edge function:
   ```
   bunx supabase functions deploy track-rpc --no-verify-jwt
   ```
   `--no-verify-jwt` is correct: the wrapper POSTs with the anon key as a Bearer token, not a user JWT. The edge function does its own allowlist + rate-limit enforcement; it must accept anon-key requests to work pre-session.
3. Set the `CORS_ORIGIN` secret on the edge function to your deployed origin(s):
   ```
   bunx supabase secrets set CORS_ORIGIN=https://your-app.web.app
   ```
   Without this, cross-origin browser requests are refused (fail-closed by design — see `_shared/cors.ts`).

### Allowlist-sync discipline (load-bearing)

The edge function at `supabase/functions/track-rpc/index.ts` ships with an EMPTY `ALLOWED_RPCS` set. **Every RPC you wrap on the client side MUST be added to that set in the same commit.** If you forget, the wrapper still POSTs, the edge function still 400s, and the wrapper still swallows the failure — you'll see it as "no telemetry rows for this RPC" rather than as a client-side error.

The wrap + allowlist entry are a pair. Don't land one without the other. When reviewing a PR that adds `withRpcTelemetry('some_rpc', ...)`, check that `'some_rpc'` appears in `ALLOWED_RPCS`.

### Reading the data

The `rpc_telemetry` table is read via the Supabase dashboard or psql (service-role only — RLS denies anon/authenticated). Useful starting queries:

```sql
-- Failure rate by RPC, last 24h
SELECT rpc,
       COUNT(*) FILTER (WHERE outcome = 'error') AS errors,
       COUNT(*) AS total,
       ROUND(100.0 * COUNT(*) FILTER (WHERE outcome = 'error') / NULLIF(COUNT(*), 0), 1) AS error_pct
FROM rpc_telemetry
WHERE created_at > now() - interval '24 hours'
GROUP BY rpc
ORDER BY error_pct DESC NULLS LAST;

-- Slowest calls (p95-ish), last 7 days
SELECT rpc, PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_ms
FROM rpc_telemetry
WHERE created_at > now() - interval '7 days' AND outcome = 'success'
GROUP BY rpc
ORDER BY p95_ms DESC;
```

## Documentation maintenance

This is the contract that prevents doc drift. For every change you land in code, the table below says **what triggers a doc update** and **where the update lands**.

| Change you're making | Update this doc | When |
|---|---|---|
| New pattern (S/C/D/SE/T/R code) | `ARCHITECTURE.md` (definition + rationale) + new `scripts/audit-*.ts` if statically-checkable + this file's pre-commit table. | Always. |
| New `scripts/audit-*.ts` | This file's pre-commit table (the 12-audit grid). Run order matters — place it correctly. | Always. |
| Audit exemption / regex tweak | `scripts/audit-*.ts` (canonical source). This file is the cheatsheet. | Always. |
| Visual token change (color, spacing, typography) | `constants/theme.ts` (canonical source) + `docs/architecture/mobile-premium-design-system.md` if it affects the design system. | Always. |
| New MobilePremium primitive | `docs/architecture/mobile-premium-design-system.md` (component inventory) + `app/dev/premium.tsx` (add to the showcase — load-bearing, the showcase IS the visual source of truth). | Always. |
| New animation/utility hook (`hooks/use*.ts`) | `hooks/index.ts` barrel + `app/dev/premium.tsx` (add an interactive demo if the hook has visible output). | Always. |
| New utility (`utils/*.ts` or `shared/utils/*.ts`) | The folder barrel (`utils/index.ts` / `shared/utils/index.ts`). | Always. |
| New navigation route / push-replace helper | `navigation/NavigationHelper.tsx` (extend `NavigationPath` enum + `navigationHierarchy` map per step 8 of the consumer guide). | Always. |
| New route wired to `<CopyForAiButton>` (consumer-side) | `navigation/routeMetadata.ts` → `ROUTE_AI_METADATA` map (add the route title + context label entry in the same change). | Always. |
| New PWA-installability change (manifest, service worker, runtime injection, icons) | `docs/architecture/pwa-installability.md`. Runtime injection block in `app/_layout.tsx` and `index.html` (if present) must stay in sync. | Always. |
| Vercel deploy config change (build command, output dir, rewrites, cache headers, function routes) | `vercel.json` (canonical source — the file is small enough to be self-documenting). This file is the cheatsheet. | Always. |
| New Zustand store | This file is enough for the cross-cutting stores. Add the 5 `// SECTION:` markers per audit D10. | Always. |
| Schema migration (consumer-side) | Migration file header (always — multi-line "why"). | Always. |
| New RPC wrapped in `withRpcTelemetry` | `ALLOWED_RPCS` set in `supabase/functions/track-rpc/index.ts` (add the entry in the same commit — see "Enabling RPC telemetry" above). | Always. |
| New edge function (`supabase/functions/<name>/`) | This file (note in invariant #10 if it changes the shell-level surface); reuse `_shared/` helpers; fail-closed CORS by default. | Always. |
| Shell-wide architectural decision | `ARCHITECTURE.md` first; cross-link here. | When the decision affects multiple files. |

### Rules

1. **One owner per claim.** If two docs appear to own the same claim, one is canonical and the other cross-links.
2. **Navigation layers don't restate content.** `README.md` and this file's intro paragraphs are navigation surfaces — they point at canonical content; they don't redefine it.
3. **Audit scripts are canonical.** If a doc and the scripts disagree, the scripts win — fix the doc.

## Canonical docs

| Claim type | Canonical owner |
|---|---|
| Repo operating context (invariants, pre-commit checks, consumer guide, doc maintenance) | this file |
| Architecture constitution (47 patterns) | `ARCHITECTURE.md` |
| Project orientation (what arqavellum is, quickstart, consumer guide) | `README.md` |
| Claim-type → owner-doc map (cross-cutting) | `docs/OWNERSHIP.md` |
| MobilePremium design system (four pillars, primitive inventory, atmosphere palettes, 490px test, gating policy) | `docs/architecture/mobile-premium-design-system.md` |
| PWA installability (manifest, SW, runtime injection, icons) | `docs/architecture/pwa-installability.md` |
| How to evolve arqavellum itself (when to fix in arqavellum vs. in a consumer) | `docs/contributing.md` |
