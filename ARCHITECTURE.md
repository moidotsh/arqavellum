# Arqavellum Architecture Constitution

> Arqavellum ships a 47-pattern architecture constitution, retuned for light-mode + PWA-first (native export is consumer extension) + email/password auth. Every pattern below is enforced by a structural audit in `scripts/audit-*.ts`; the audits are the load-bearing mechanism that keeps a consumer's codebase from drifting within 50 commits.

## Pattern Index

| ID | Pattern | Section |
|----|---------|---------|
| S1 | Platform Abstraction Layer | System |
| S2 | Animation Hooks (premium/shared/Motion) | System |
| S3 | Animation Constants | System |
| S4 | State Management | System |
| S5 | Barrel Exports | System |
| S6 | Conditional Rendering | System |
| S7 | Theme Access (light-only) | System |
| S8 | API Client (fetchWithRetry) | System |
| S9 | Service Layer / Repository Pattern | System |
| S10 | Error Handling (AppError) | System |
| S11 | Logging System | System |
| S12 | Input Validation | System |
| S13 | Query Keys | System |
| S14 | Encryption (generic AES) | System |
| S16 | Composite UI State Hook | System |
| S17 | Date Helpers | System |
| S18 | Tamagui Type Augmentation | System |
| S19 | Package Manager — Bun | System |
| S20 | Pre-commit Hooks (10 audits) | System |
| C1 | Navigation System | Component |
| C2 | Modal System | Component |
| C3 | Responsive Architecture | Component |
| C4 | Loading States (Three-Tier) | Component |
| C5 | Empty States | Component |
| C7 | Touch Interactions | Component |
| C8 | Progressive Disclosure | Component |
| C9 | Container Query System | Component |
| C10 | Deprecated Component Wrapper | Component |
| D1 | React Query Configuration | Data |
| D2 | Optimistic Updates | Data |
| D3 | Cache Invalidation | Data |
| D4 | Offline Queue System | Data |
| D5 | Repository Pattern | Data |
| D6 | Type Separation (Three-Tier) | Data |
| D8 | Retry Mechanism | Data |
| D10 | Store State Categories (SECTION markers) | Data |
| SE1 | Authentication Flow (email/password) | Security |
| SE2 | Key Management | Security |
| SE3 | Environment Validation | Security |
| T1 | Test Organization | Testing |
| T2 | Mock Configuration | Testing |
| T3 | Test Utilities | Testing |
| R4a | Timer Cleanup | Runtime |
| R4b | Listener Cleanup | Runtime |
| R1 | Async Effect Cancellation | Runtime |

> **Deliberately absent from this constitution:** S15 (platform-specific content system — App Store / Play Store differences, not relevant at the shell level — consumer-extension territory), C6 (list optimization — domain-specific), C11 (Stories tutorial system — skipped per Open Question 4), D9 (grid-based calculations — domain-specific), R1-RPC (`verify_session` audit — arqavellum has no PIN auth by default).

## Quick Start (Read This First)

| Task Type | Required Reading | Also Check |
|-----------|------------------|------------|
| New UI component | Theme Access (#7) → Touch Interactions (C7) | Animation Hooks (#2-3) |
| API / data work | Repository Pattern (D5) → API Client (S8) → Error Handling (S10) | Query Keys (S13) |
| Auth / security | Auth Flow (SE1) → Key Management (SE2) | Service Layer (S9) |
| Adding tests | Test Organization (T1) → Mock Configuration (T2) | — |
| Refactoring | All System Patterns | Look up specific patterns below |
| Bug fix | Find matching pattern → Check "Prohibited" section | Related patterns in same section |

**Pattern Format:** Every pattern follows this structure:
- **Rule** — what you must do
- **Usage** — how to do it
- **Prohibited** — what to avoid
- **Location** — where the canonical implementation lives

---

## System Patterns

### S1. Platform Abstraction Layer
- **Rule:** All platform checks go through `utils/platform.ts`.
- **Usage:** `import { isWeb, isNative, isIOS, isAndroid } from '@utils';`
- **Prohibited:** Scattered `Platform.OS === 'web'` checks, `navigator.userAgent` reads, `process.platform` reads in component code.

### S2. Animation Hooks (premium/shared/Motion)
- **Rule:** Use the motion primitives in `components/premium/shared/Motion.tsx` — `FadeIn`, `Crossfade`, `Shake`, `usePressedStyle`, `useFocusRing`, `useReducedMotion`.
- **Usage:** `<FadeIn duration={DURATION.moderate}>...</FadeIn>`
- **Prohibited:** `useRef(new Animated.Value(...))` boilerplate in components. Reanimated's `useAnimatedStyle` is permitted only when Motion primitives can't express the animation.

### S3. Animation Constants
- **Rule:** Use `DURATION` from `constants/animation.ts`.
- **Usage:** `duration: DURATION.moderate`
- **Prohibited:** Hardcoded durations like `duration: 400`.

### S4. State Management
- **Rule:** Follow the decision matrix.
- **Quick Reference:**
  - Server state → React Query (`hooks/queries/`, `hooks/mutations/`)
  - Client state → Zustand (`stores/`)
  - Theme/responsive only → Context (limited use — TamaguiProvider, ResponsiveProvider)
- **Duplication Prohibition:** If a Zustand store exists for a domain, Context MUST NOT be used for the same state.
- **Prohibited:** Mixing server state in Zustand; new Contexts for UI state that a Zustand store could hold.

### S5. Barrel Exports
- **Rule:** Same-folder imports go to the relative source (`./Foo`); cross-folder imports go through the folder barrel (`@utils`, `@components`, etc.).
- **Audit:** `audit-barrels.ts` is the only audit with `--fix` — `bun run scripts/audit-barrels.ts --fix` rewrites most violations automatically.
- **Prohibited:** Direct deep-path imports when a barrel re-exports the symbol (`../Layout/DesktopAuthLayout` instead of `../Layout`).

### S6. Conditional Rendering
- **Rule:** Use ternaries or `!!expr && <Component/>` coercion for conditional children.
- **Prohibited:** `{count && <Component/>}` — renders `0` or `""` as children when the left side is falsy-but-not-boolean.

### S7. Theme Access
- **Rule:** Both `theme.colors.light.*` and `theme.colors.dark.*` ship in `constants/theme.ts`. The active palette is resolved at runtime by `useAppTheme()` (per invariant #3 in `CLAUDE.md`); component code reads `colors.*` from the resolved palette and never indexes by mode. Light is the default; dark is opt-in.
- **Audit:** `audit-ui-theme.ts` blocks hardcoded hex colors and `Dimensions.get('window')` — both are S7 violations.
- **Prohibited:** `'#4F46E5'` literal in a component. Direct mode-indexed access (`theme.colors.light.*` or `theme.colors.dark.*`) in component code — read from `useAppTheme()`'s resolved `colors.*` instead. SVG vectors and `constants/theme.ts` are exempt — they are the source of truth.

### S8. API Client (fetchWithRetry)
- **Rule:** Use `fetchWithRetry()` from `utils/api-client.ts`. Better: go through the repository layer — repositories should be the only call sites for network I/O outside `api-client.ts` itself.
- **Audit:** structural ESLint blocks raw `fetch()`.
- **Prohibited:** Direct `fetch()` in `app/`, `hooks/`, `components/`, `services/`. `utils/api-client.ts` and `utils/supabase/client.ts` are the exempt low-level shims.

### S9. Service Layer / Repository Pattern
- **Rule:** UI code calls services → services call repositories → repositories call Supabase. UI never touches `supabase.*` directly.
- **Usage:** `hooks/queries/useRecords.ts` → `services/recordService.ts` → `utils/supabase/repositories/RecordRepository.ts`.
- **Audit:** `audit-data-layer.ts` blocks direct `supabase.*` in `app/`, `hooks/`, `components/`, `context/`.

### S10. Error Handling (AppError)
- **Rule:** Boundary-crossing throws use `throw new AppError(code, ...)`. UI surfaces consume `getUserFriendlyMessage(error)`.
- **Audit:** `audit-logging-errors.ts` blocks raw `throw new Error(...)` outside its carve-out.
- **Prohibited:** `throw new Error('something')` across a service boundary — the consumer can't pattern-match on it.
- **Two-pipeline design:** Repositories return `RepositoryResult<T>` (structured failure, no throw) so callers can triage. Services bridge to the throwing pipeline via `throwIfFailed<T>(result, context): T` (in `utils/supabase/repositories/types.ts`) — on success it unwraps `result.data`; on failure it logs to `logger.error('repository', ...)` and throws `handleApiError(result.error, context)`. Call sites should assign the return value (`const data = throwIfFailed(result, ctx)`) — TS cannot narrow through the function call.
- **RepositoryError → AppError mapping:** `repoCodeToAppCode(code)` in `utils/errors.ts` is the load-bearing switch that maps `RepositoryErrorCode` → `ErrorCode`. `NETWORK_ERROR → NETWORK_ERROR` (recoverable); all other codes map to non-recoverable. Implemented as a switch *inside a function body* (not a top-level const map) to defer enum lookup past module init and break the `errors ↔ repositories/types` import cycle. This is why the React Query retry predicate (`lib/react-query/queryClient.ts`) makes the same decision for an `AppError` thrown via `throwIfFailed` as it did for the raw `RepositoryError` it replaced.

### S11. Logging System
- **Rule:** Use `logger` from `utils/logger.ts`. This is the single legitimate `console.*` site.
- **Audit:** `audit-logging-errors.ts` blocks live `console.log/warn/error` everywhere else.
- **Prohibited:** `console.log('debug')` in component code.

### S12. Input Validation
- **Rule:** Domain validators live in `utils/validation.ts` (generic) or co-located with the repository (domain-specific). Use Zod for schema validation at IO boundaries.
- **Audit:** `audit-security.ts` blocks anchored-regex `.test()` in client code (ReDoS risk).

### S13. Query Keys
- **Rule:** All query keys go through the `queryKeys` factory in `lib/react-query/queryKeys.ts`.
- **Audit:** `audit-data-layer.ts` blocks inline `queryKey: [...]` literals.
- **Prohibited:** `useQuery({ queryKey: ['records', userId], ... })` — add a `queryKeys.records.list(userId)` factory instead.

### S14. Client-side encryption (deliberately absent)
- **Rule:** Arqavellum ships **no generic client-side encryption module.** The prior `utils/encryption.ts` + `utils/keyManagement.ts` + `utils/cryptoPolyfill.ts` were removed because they provided no meaningful security uplift: any same-origin JS (including XSS payload) can read `localStorage`/`sessionStorage` and encryption keys stored there, so client-side encryption with localStorage-backed keys does not raise the bar against the threat it implies it addresses.
- **Consumer extension:** Apps handling confidential content require **a specific threat model** and either (a) a **server-side encryption and key-management design** or (b) a separately designed **end-to-end-encryption protocol** with keys derived from a user-chosen passphrase and never persisted in browser storage.
- **Prohibited:** Re-adding a generic "encrypt with a localStorage-backed key" helper. Reach for `expo-secure-store` (native) only behind a concrete threat model.

### S16. Composite UI State Hook
- **Rule:** Multi-source UI state (loading + error + value + derived flag) gets a `useXxxState` hook that returns the composite shape.
- **Prohibited:** Four parallel `useState` calls in a component that always move together.

### S17. Date Helpers
- **Rule:** Date formatting goes through `utils/validation.ts` (`normalizeDateToISO`, `isSameDay`) or `date-fns`. Build dates from local components, not `toISOString()` (shifts the day backwards for users east of UTC).
- **Prohibited:** `new Date(str).toISOString().split('T')[0]` for "today" semantics.

### S18. Tamagui Type Augmentation
- **Rule:** Custom Tamagui tokens are declared via module augmentation in `tamagui.config.ts`. Consumers adding tokens extend the same `TamaguiCustomConfig` interface.
- **Prohibited:** `as any` casts to bypass Tamagui's token type-checking.

### S19. Package Manager — Bun
- **Rule:** Bun everywhere. Commit `bun.lock`. Never commit `package-lock.json` or `yarn.lock`.
- **Audit:** `audit-pattern-compliance.ts` blocks both alternative lockfiles.

### S20. Pre-commit Hooks (10 audits)
- **Rule:** `.husky/pre-commit` runs `bun run lint:structure && bunx tsc --noEmit`. The 10 audits (see CLAUDE.md → Pre-commit checks) are the load-bearing enforcement layer.
- **Escape hatches:** `// <check>-exempt` for one-off suppressions with justification; `git commit --no-verify` for genuine emergencies only.

---

## Component Patterns

### C1. Navigation System
- **Rule:** Use Expo Router's `router` via helpers in `navigation/NavigationHelper.tsx` (consumers create this file with their route map). Auth-gated navigation goes through `hooks/useAuthNavigation.ts`.
- **Audit:** `audit-component-quality.ts` blocks direct `router.push/replace/back` outside the helper files.
- **Prohibited:** `router.push('/home')` in a component body.

### C2. Modal System
- **Rule:** Use `MobileDialog` from `components/MobilePremium/` for all modal-style UI.
- **Audit:** `audit-component-quality.ts` blocks raw RN `Modal`.
- **Prohibited:** `<Modal visible={...}>` from `react-native`.

### C3. Responsive Architecture
- **Rule:** Use `useResponsive()` (consumers add) or `useWindowDimensions()`. Container-level responsiveness uses `useContainerVariant()` (defined in `constants/breakpoints.ts`).
- **Audit:** `audit-ui-theme.ts` blocks `Dimensions.get('window')` and `Dimensions.get('screen')`.
- **Prohibited:** `Dimensions.get('window').width` in component code.

### C4. Loading States (Three-Tier)
- **Rule:** Three tiers — `LoadingSpinner` (inline), `LoadingOverlay` (full-screen blocking), `AppLoading` (initial app boot). Consumers add the primitives; arqavellum ships the spec.
- **Audit:** `audit-component-quality.ts` blocks `ActivityIndicator` outside loading primitives.
- **Prohibited:** `<ActivityIndicator>` directly in a screen.

### C5. Empty States
- **Rule:** Every list/grid screen ships an empty state. Empty states have: icon, headline, supporting copy, primary CTA.

### C7. Touch Interactions
- **Rule:** Use `usePressedStyle()` from `components/premium/shared/Motion.tsx` for press feedback. Haptics via `expo-haptics`.
- **Prohibited:** `onPressIn`/`onPressOut` manually driving `Animated.Value` for scale feedback — use the hook.

### C8. Progressive Disclosure
- **Rule:** Complex forms reveal fields as the user makes choices. Use `MobileStepper` for multi-step flows; collapse advanced options behind a "Show more" affordance.

### C9. Container Query System
- **Rule:** Layout-density decisions (compact/medium/full variant) come from `getComponentVariant(width)` in `constants/breakpoints.ts`. The variant drives token selection, not the other way around.

### C10. Deprecated Component Wrapper
- **Rule:** When deprecating a component, leave a thin re-export shim that forwards to the replacement. Add an entry to a `DEPRECATED_SYMBOLS` registry (audit-pattern-compliance config).
- **Audit:** `audit-pattern-compliance.ts` blocks new imports of deprecated symbols.

---

## Data Patterns

### D1. React Query Configuration
- **Rule:** The shared `queryClient` lives in `lib/react-query/queryClient.ts`. Default staleTime is 5 minutes; auth errors trigger the registered handler.
- **Usage:** Wrap the app in `<QueryProvider>` (defined in `lib/react-query/QueryProvider.tsx`).

### D2. Optimistic Updates
- **Rule:** Mutations that update an existing cache entry MUST apply an optimistic update via `onMutate` → `setQueryData` → `onError` rollback.
- **Audit:** `audit-state.ts` blocks `useMutation` calls that don't touch a cache primitive.
- **Prohibited:** A mutation that updates a record but doesn't invalidate or roll back `queryKeys.<domain>.*`.

### D3. Cache Invalidation
- **Rule:** Mutations call `invalidateQueries` / `setQueryData` / `removeQueries` / `.clear()` in their `onSuccess` or `onSettled`.
- **Audit:** Same hook as D2 (`audit-state.ts`).

### D4. Offline Queue System
- **Rule:** Mutations that must survive network drops go through `services/offlineQueueService.ts` (extends `BaseQueueService<T>`). The queue persists to AsyncStorage and flushes on reconnect (driven by `stores/networkStore.ts`).

### D5. Repository Pattern
- **Rule:** Data access goes through repositories in `utils/supabase/repositories/`. Every repository method returns `Promise<RepositoryResult<T>>`. Concrete repositories are standalone classes with static methods — consumers drop new files into this folder and re-export via the barrel.
- **Audit:** `audit-data-layer.ts` flags repository methods that don't return `RepositoryResult<T>`.
- **Shared utilities in `utils/supabase/repositories/types.ts`:** `RepositoryResult<T>`, `RepositoryError`, `RepositoryErrorCode`, `ok()`, `err()`, `validateWithSchema()`, `classifySupabaseError()`, `handleRepositoryError()`, `unauthorized<T>(reason?)`, `throwIfFailed<T>(result, context): T` (the bridge to the throwing pipeline — see §S10).
- **Domain types at boundary:** Repository methods return domain-shaped types (camelCase, semantically named) — not raw snake_case DB rows. When a row carries two timestamps with different semantics (e.g. `created_at` = row insertion vs `registration_completed_at` = a domain event), the repository's return type should expose both as named fields so the service layer picks the semantically correct one. The decision is explicit at the service call site, not buried in the repo.
- **`withRpcTelemetry(rpc, actorId, fn)`** (`utils/supabase/rpcTelemetry.ts`): repo methods that call `supabase.rpc(...)` should wrap the call — fire-and-forget POST to `/functions/v1/track-rpc` with outcome + duration. Transparent to error handling (returns the original result; telemetry failures swallowed). Arqavellum ships the full system — wrapper + edge function (`supabase/functions/track-rpc/`) + table (`supabase/migrations/00000000000000_rpc_telemetry.sql`) — but the edge function ships with an EMPTY allowlist. See "Enabling RPC telemetry" in `CLAUDE.md` for the deploy + allowlist-sync steps.
- **`// d5-exempt`:** legitimate carve-outs for direct Supabase access (e.g. low-level client wrappers in `utils/supabase/client.ts`, the `AuthService` path that needs `supabase.auth.*` directly) suppress with a one-line justification. Prefer routing through a repo method; suppress only when the wrapper *is* the seam.

### D6. Type Separation (Three-Tier)
- **Rule:** Three type tiers:
  1. **Wire types** — raw shapes from Supabase / external APIs. Live in `shared/types/` or consumer's domain types.
  2. **Repository-normalized types** — the canonical app shape after repository mapping. UI code imports these.
  3. **UI types** — component-prop-local types, derived from #2.
- **Audit:** `audit-testing-types.ts` blocks UI code importing raw `shared/types` when a repository-normalized variant exists.
- **Prohibited:** A component receiving a raw Supabase row type — repositories normalize first.

### D8. Retry Mechanism
- **Rule:** Network calls retry via `fetchWithRetry()` (3 attempts, exponential backoff: 1s, 2s, 4s). Repository methods wrap their Supabase calls in `tryAsync()` from `utils/errors.ts` to convert thrown errors into `Result<T>`.

### D10. Store State Categories (SECTION markers)
- **Rule:** Every Zustand store has five `// SECTION:` markers in this exact order: `Loading`, `Error`, `Modals`, `Selection`, `UI`. The markers are how audit-state confirms the store's shape — drift here causes a commit block.
- **Usage:**
  ```typescript
  export const useUiStore = create<UiState>()((set, get) => ({
    // SECTION: Loading
    isLoading: false,
    // SECTION: Error
    error: null,
    // SECTION: Modals
    isModalVisible: false,
    // SECTION: Selection
    selectedId: null,
    // SECTION: UI
    forceUpdate: 0,
  }));
  ```

---

## Security Patterns

### SE1. Authentication Flow (email/password)
- **Rule:** Arqavellum's default auth surface is email/password via Supabase. The `AuthService` in `utils/supabase/AuthService.ts` wraps signUp/signIn/signOut/session-refresh.
- **Consumer extension:** A consumer needing PIN+device-UUID auth re-adds `MobilePinInput`, `MobileFullPagePinEntry`, `MobilePinReauthSheet`, `_PinKeypad` primitives AND the `audit-rpc-auth.ts` script AND a `verify_session` RPC. The decision is per-consumer.
- **Prohibited:** Storing the user's password or session token in plain AsyncStorage. Sessions are Supabase-managed (JWT in memory + refresh-token cookie); arqavellum does not persist raw credentials.

### SE2. Client-side secret storage (deliberately minimal)
- **Rule:** Arqavellum persists only non-secret UI preferences (theme color-scheme via `zustandStorage` at key `arqavellum:color-scheme`, network-status flags, UI toggles). Auth sessions are Supabase-managed. Arqavellum does **not** persist encryption keys, API keys, or any other credential in browser or native storage.
- **Audit:** `audit-security.ts` (SE2) blocks `@react-native-async-storage/async-storage` imports outside the `stores/storage.ts` allowlist. Note: SE2 is **narrow** — it covers AsyncStorage imports only, NOT `window.localStorage`, `sessionStorage`, or `document.cookie`. Those are unrestricted today; arqavellum's policy of "no persisted credentials" is enforced by review, not by audit.
- **Prohibited:** `AsyncStorage.setItem('encryptionKey', ...)` or `localStorage.setItem('apiKey', ...)`. Apps needing client-side credential storage (rare) require a specific threat model and a deliberately designed storage primitive.

### SE3. Environment Validation
- **Rule:** `constants/supabase.ts:requiredEnv()` is the canonical env check. It runs at module load (when `constants/supabase.ts` is imported). Production throws on missing required vars (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`); dev warns once via `logger` and falls back to `''` so the `/dev/premium` showcase renders before Supabase is configured.
- **Prohibited:** Hardcoded Supabase URLs or anon keys in source.

---

## Testing Patterns

### T1. Test Organization
- **Rule:** Tests live in `__tests__/` directories next to the code under test. Filename: `<module>.test.ts`.
- **Audit:** `audit-testing-types.ts` blocks test files outside `__tests__/`.

### T2. Mock Configuration
- **Rule:** Mocks live in `__tests__/setup.ts` and are centralized. Inline `vi.mock()` calls are blocked.
- **Audit:** `audit-testing-types.ts` blocks inline `vi.mock()`.

### T3. Test Utilities
- **Rule:** Test helpers (render wrappers, factories) live in `__tests__/utils/`. Re-use, don't recreate per test.

---

## Runtime Resilience Patterns

### R4a. Timer Cleanup
- **Rule:** Every `setInterval` / `setTimeout` that lives beyond a single render has a paired `clearInterval` / `clearTimeout` in the same effect's cleanup.
- **Audit:** `audit-runtime-resilience.ts` blocks `setInterval` without `clearInterval` in the same file.

### R4b. Listener Cleanup
- **Rule:** Every `addEventListener` has a paired `removeEventListener` in the same effect's cleanup.
- **Audit:** `audit-runtime-resilience.ts`.

### R1. Async Effect Cancellation
- **Rule:** Async `useEffect`s that setState or navigate after `await` MUST guard with a `cancelled` flag, `isMountedRef`, or `AbortController`.
- **Audit:** `audit-runtime-resilience.ts`.
- **Prohibited:** `useEffect(() => { fetch(...).then(setData) }, [])` — if the component unmounts before the promise resolves, you'll setState on an unmounted component.

---

## File Locations

| Concern | Location |
|---------|----------|
| Utilities | `utils/` (barrel: `utils/index.ts`) |
| Constants + theme tokens | `constants/` (barrel: `constants/index.ts`) |
| React Query layer | `lib/react-query/` (barrel: `lib/react-query/index.ts`) |
| Shared types (cross-cutting) | `shared/types/` |
| Supabase client + repos | `utils/supabase/`, `utils/supabase/repositories/` |
| Zustand stores | `stores/` |
| Domain services | `services/` |
| React Query hooks | `hooks/queries/`, `hooks/mutations/` |
| Premium motion primitives | `components/premium/shared/` |
| MobilePremium kit | `components/MobilePremium/` |
| Routes | `app/` (Expo Router file-based) |
| Audit scripts | `scripts/audit-*.ts` |

## Consumer extension points

Arqavellum ships with deliberate gaps that consumers fill. The shell doesn't ship:
- Domain types (products, sessions, records, etc.) — consumers add to `shared/types/`
- Domain repositories — consumers add standalone repository classes with static methods
- Domain stores — consumers add to `stores/`
- Domain routes — consumers replace the placeholder home + add domain routes to `app/`
- Domain services — consumers add to `services/`
- Navigation helper — consumers create `navigation/NavigationHelper.tsx` with their route map
- Loading primitives — consumers add `LoadingSpinner`, `LoadingOverlay`, `AppLoading` (or import from a shared kit)

The shell DOES ship:
- All cross-cutting utilities (`utils/*`)
- The light theme + tokens (`constants/theme.ts`)
- The MobilePremium kit (`components/MobilePremium/*`)
- The premium motion primitives (`components/premium/shared/*`)
- The auth flow (`app/login.tsx`, `app/register.tsx`, `app/forgot-password.tsx`)
- The settings screen (`app/settings.tsx`)
- The design-system showcase (`app/dev/premium.tsx`)
- The 10-audit pre-commit gate (`scripts/audit-*.ts` + `.husky/pre-commit`)
