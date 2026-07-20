# Arqavellum — Post-Intake Hardening Audit

**Branch:** `chore/report-arqavellum-post-intake-audit`
**Scope:** findings only. No production code, tests, configuration,
documentation, generated output, migrations, or remote services were
modified. `armandotfit` was not inspected.
**Method:** static read of the intake commit range (`ecae0f7 → e43918c`)
plus running the pre-commit gate and test suite on the working tree.

---

## 1. Task description

Determine whether the recently added reusable MobilePremium UI primitive
intake is ready for a separate Arman Fit mirror-planning pass. The audit
covers generic ownership, TypeScript API quality, accessibility,
responsive behavior, light/dark token usage, reduced-motion honoring,
safe-area / mobile constraints, and compliance with arqavellum's
existing structural audits. The audit also verifies that no
product-specific route, store, service, repository, schema,
workout / exercise data, fitness copy, or brand identity has leaked into
the shell, and identifies — but does not produce — the file surface a
future deliberate mirror would need to evaluate.

Intake under review:

- `ecae0f7` — ActivityGrid heatmap primitive + mobile shell polish.
- `ab39b3d` — 16 new MobilePremium primitives + the SB2 portal
  content-width audit + the `CONTENT_WIDTH_MODE` policy +
  LoadingOverlay refactor + supporting test infrastructure.
- `c46f1e0` — documentation of SB1 / SB2 + expanded MobilePremium
  inventory in `docs/architecture/mobile-premium-design-system.md`.
- `e43918c` — SB2 test coverage hardening + targeted domain-neutrality
  fixes in `MobileStepper`, `ActivityGrid`, `MobileDialog`.

## 2. Files inspected

### Production source — new MobilePremium primitives (17 files)

- `components/MobilePremium/ActivityGrid.tsx`
- `components/MobilePremium/ActivityGridPreview.tsx`
- `components/MobilePremium/Avatar.tsx`
- `components/MobilePremium/CalendarGrid.tsx`
- `components/MobilePremium/CarouselTutorial.tsx`
- `components/MobilePremium/DatePickerField.tsx`
- `components/MobilePremium/DisclosureRow.tsx`
- `components/MobilePremium/EmptyState.tsx`
- `components/MobilePremium/FilterChip.tsx`
- `components/MobilePremium/FilterChipGroup.tsx`
- `components/MobilePremium/MobileSheet.tsx`
- `components/MobilePremium/OfflineBanner.tsx`
- `components/MobilePremium/ProgressRing.tsx`
- `components/MobilePremium/RevealMask.tsx`
- `components/MobilePremium/SegmentedControl.tsx`
- `components/MobilePremium/SegmentedProgress.tsx`
- `components/MobilePremium/StatCard.tsx`
- `components/MobilePremium/Wizard.tsx`

### Production source — touched by the intake

- `components/MobilePremium/MobileStepper.tsx` — domain-neutrality pass
  (`e43918c`).
- `components/MobilePremium/MobileDialog.tsx` — width-contract comment
  tightened (`e43918c`); SB2 policy spread applied (`ab39b3d`).
- `components/MobilePremium/MobileSelect.tsx` — SB2 policy spread
  applied to `sheet` panel (`ab39b3d`).
- `components/MobilePremium/MobileActionFooter.tsx`,
  `MobileAlert.tsx`, `MobileHeader.tsx`, `MobileHomeHeader.tsx`,
  `MobileInput.tsx`, `MobilePrimaryButton.tsx`,
  `MobileSectionEyebrow.tsx`, `MobileSettingsRow.tsx`,
  `MobileStepRail.tsx`, `MobileSurface.tsx` — policy-spread /
  token-migration touch-ups (`ab39b3d`).
- `components/MobilePremium/index.ts` — barrel re-exports for all new
  primitives.
- `components/MobilePremium/showcase.tsx` — registration blocks for
  every new primitive.
- `components/premium/shared/Motion.tsx` — `Crossfade` tightening.
- `components/primitives/LoadingOverlay.tsx` — refactored to compose
  `MobileDialog`.
- `components/primitives/Toast.tsx` — SB2 policy spread applied.

### Foundation

- `constants/index.ts`, `constants/styles.ts` — `CONTENT_WIDTH_MODE`
  single source of truth + `MOBILE_CONTENT_WIDTH_STYLE`,
  `MOBILE_DIALOG_WIDTH_STYLE`, `SCREEN_BODY_STYLE`.
- `hooks/useActivityGridLayout.ts`, `utils/activityGrid.ts`,
  `utils/date-helpers.ts`, `utils/retry.ts` — pure helpers backing
  ActivityGrid and DatePickerField.

### Tests

- `__tests__/scripts/audit-mobile-content-width.test.ts` — 22 cases
  pinning the SB2 contract.
- `__tests__/components/{ActivityGrid,Avatar,CarouselTutorial,DatePickerField,
  DisclosureRow,EmptyState,FilterChip,FilterChipGroup,LoadingOverlay,
  MobileSheet,OfflineBanner,ProgressRing,RevealMask,SegmentedControl,
  SegmentedProgress,StatCard,Wizard}.test.tsx` — 17 focused test files.
- `__tests__/hooks/useActivityGridLayout.test.ts`,
  `__tests__/utils/activityGrid.test.ts` — pure-core coverage for
  ActivityGrid.
- `__tests__/setup.ts`, `__mocks__/react-native.ts`,
  `__mocks__/react-native-svg.ts`,
  `__mocks__/@react-native-community/datetimepicker.ts` — test
  infrastructure introduced or expanded by `ab39b3d`.

### Audit scripts + wiring

- `scripts/audit-mobile-content-width.ts` — new SB2 audit.
- `scripts/audit-component-quality.ts` — `MobileSheet` added to
  `C2_EXEMPT_FILES`.
- `scripts/audit-screen-body.ts` — policy-mode awareness.
- `package.json` — `lint:structure` includes SB2.
- `.husky/pre-commit` — **inspected; see finding F3**.

### Documentation

- `CLAUDE.md` — pre-commit table updated to 12 audits + new
  content-width policy section.
- `ARCHITECTURE.md` — S20 row + body updated to 12 audits, with the
  SB1/SB2 namespace note.
- `docs/architecture/mobile-premium-design-system.md` — new
  `EmptyState`, `OfflineBanner`, `StatCard`, `ActivityGrid`,
  `SegmentedProgress`, `ProgressRing`, `Avatar`, `SegmentedControl`,
  `FilterChip`, `FilterChipGroup`, `DisclosureRow`, `DatePickerField`,
  `CalendarGrid`, `MobileSheet`, `RevealMask`, `CarouselTutorial`,
  `Wizard` inventory rows + §10.1 content-width policy.
- `app/dev/premium.tsx` — showcase route (unchanged but re-verified
  against the new registrations).

`armandotfit` was not opened. No armandotfit-derived code, types,
constants, or copy were observed in any arqavellum file under
inspection.

## 3. Current branch and working-tree status

```
Branch:           chore/report-arqavellum-post-intake-audit
Base:             main (HEAD = e43918c)
Working tree:     clean before branch creation.
New files on
this branch:      _reports/arqavellum-post-intake-audit.md (this file)
Production
touches:          none.
```

The intake itself landed on `main` as four sequential commits
(`ecae0f7`, `ab39b3d`, `c46f1e0`, `e43918c`). At audit time `main` was
clean and the working tree was clean. All gates (see §7) pass on the
as-audited tree.

## 4. Primitive inventory and ownership classification

All 17 new primitives are reviewed below. Ownership is classified as:

- **shell** — fully domain-neutral; ships as-is in arqavellum and is a
  mirror candidate subject to the findings below.
- **shell / touch-point** — shell-owned but interacts with a
  consumer-supplied slot or extension point; mirror, but the consumer
  adaptation contract must be respected.
- **consumer-only** — would not mirror.

No primitive in the inventory is consumer-only. The leak scan (§1 of
this report's analysis) found zero armandotfit / sibling-repo / Supabase
project references and zero non-shell URLs. Public-repository
discipline holds at the source level. The product-leak findings in §6
are localized to the showcase's *demo copy*, not primitive code.

| Primitive | File | Classification | Notes |
|---|---|---|---|
| ActivityGrid | `components/MobilePremium/ActivityGrid.tsx` | shell | Generic heatmap. `data: ActivityGridDatum[]` is `{ date, value, label? }` — no domain payload. Layout / levels / a11y all generic. |
| ActivityGridPreview | `components/MobilePremium/ActivityGridPreview.tsx` | shell (dev-only) | Dev preview host. Sample data is synthetic. One internal a11y nit (§6). |
| Avatar | `components/MobilePremium/Avatar.tsx` | shell | Generic "person" affordance. Image source + name + presence. |
| CalendarGrid | `components/MobilePremium/CalendarGrid.tsx` | shell | Month grid, YYYY-MM-DD boundary contract, local-component date construction (no UTC drift). |
| CarouselTutorial | `components/MobilePremium/CarouselTutorial.tsx` | shell | Generic step-through carousel; explicitly not a Stories system. |
| DatePickerField | `components/MobilePremium/DatePickerField.tsx` | shell | YYYY-MM-DD string boundary. Native branch uses `@react-native-community/datetimepicker` (8.4.4 — first source consumer; new runtime dep). |
| DisclosureRow | `components/MobilePremium/DisclosureRow.tsx` | shell | Generic expand/collapse; controlled + uncontrolled. |
| EmptyState | `components/MobilePremium/EmptyState.tsx` | shell | No preset copy, no icon library, no variant codes. |
| FilterChip | `components/MobilePremium/FilterChip.tsx` | shell | Role/state contract (`button`→`selected`, `radio`/`checkbox`→`checked`) enforced at the component level. |
| FilterChipGroup | `components/MobilePremium/FilterChipGroup.tsx` | shell | Purely presentational. Strict scope (no ScrollView, no sticky, no a11y role of its own). |
| MobileSheet | `components/MobilePremium/MobileSheet.tsx` | shell | Portal pattern via RN `Modal`; `c2-exempt` registered. |
| OfflineBanner | `components/MobilePremium/OfflineBanner.tsx` | shell | Three variants (`offline`, `syncing`, `sync-failed`) are generic connectivity states. |
| ProgressRing | `components/MobilePremium/ProgressRing.tsx` | shell | First source consumer of `react-native-svg` (15.12.1 — new runtime dep; auto-linked by Expo SDK 54). |
| RevealMask | `components/MobilePremium/RevealMask.tsx` | shell | Visual-privacy wrapper. The non-security disclaimer in the file header is load-bearing and must ride the mirror. |
| SegmentedControl | `components/MobilePremium/SegmentedControl.tsx` | shell | `selection` (radiogroup/radio) vs `tabs` (tablist/tab) variants. No `aria-controls` wiring — consumer-owned panel composition by design. |
| SegmentedProgress | `components/MobilePremium/SegmentedProgress.tsx` | shell | Multi-segment bar. Consumer supplies goal semantics. |
| StatCard | `components/MobilePremium/StatCard.tsx` | shell | Single-metric card. Three variants × three sizes. Optional `onPress` turns it into a button. |
| Wizard | `components/MobilePremium/Wizard.tsx` | shell | Thin composition helper. Controlled — no internal state machine, no persistence, no onboarding domain model. |

Touched primitives (`MobileStepper`, `MobileDialog`, `MobileSelect`,
`MobileActionFooter`, `MobileAlert`, `MobileHeader`, `MobileHomeHeader`,
`MobileInput`, `MobilePrimaryButton`, `MobileSectionEyebrow`,
`MobileSettingsRow`, `MobileStepRail`, `MobileSurface`,
`LoadingOverlay`, `Toast`, `Motion`) remain shell-owned; the touches
are policy-spread migrations, width-contract comment tightening, and
targeted neutrality fixes. None of them introduce a domain concept.

**New runtime dependencies introduced by the intake** (visible in
`package.json`): `@react-native-community/datetimepicker` 8.4.4,
`react-native-svg` 15.12.1, `date-fns` ^4.1.0. All three are generic,
widely-used, and consistent with the PWA-first shell contract. A
consumer that does not need `DatePickerField` could remove the
datetimepicker dependency, but it ships in the shell by default.

## 5. API and TypeScript findings

The API surface across the intake is generally strong: every primitive
ships a typed `Props` interface with JSDoc on every field, exported
named type aliases for the discriminated unions (`StatCardVariant`,
`AvatarSize`, `FilterChipAccessibilityRole`, `RevealMaskVariant`,
`OfflineBannerVariant`, `Segment<T>`, `ProgressSegment`,
`ActivityGridLevel`, `ActivityGridLayoutMode`, `TutorialSlide`,
`WizardStep`, `EmptyStateAction`), and prop names follow the existing
kit conventions (`accentColor`, `accessibilityLabel`, `testID`,
`style`). Generic parameters are used correctly where the value type is
consumer-supplied (`SegmentedControlProps<T>`, `Segment<T>`).

`tsc --noEmit` passes clean. The findings below are minor and none
block mirror-readiness; they should be cleaned up before or during the
mirror pass to avoid copying the rough edges into the consumer.

### F1 — `SegmentedControl` dead ternary branch
**File:** `components/MobilePremium/SegmentedControl.tsx:122-126`
**Severity:** low (cosmetic / code-smell).

```ts
backgroundColor: active
  ? colors.brand
  : chromeless
    ? 'transparent'
    : 'transparent',
```

The two inner branches are identical. The `chromeless` flag is
consulted for padding / height / text color elsewhere in the same
Pressable, but for the unselected-segment background it has no effect.
Reads as a copy-paste leftover. Should collapse to `: 'transparent'`
(or, more cleanly, factor the whole backgroundColor decision into a
small helper that documents the active-vs-chromeless matrix).

### F2 — `MobileSheet` `eslint-disable-next-line react-hooks/exhaustive-deps` on an escape-listening effect
**File:** `components/MobilePremium/MobileSheet.tsx:86-94`
**Severity:** low (correctness / lint hygiene).

The escape-to-close `useEffect` captures `handleClose` (re-created
every render) and `open` / `closeOnBackdropTap`. The deps array is
`[isWeb, open, closeOnBackdropTap]`; the suppression comment covers the
omission of `handleClose`. This is benign today because the only
variable `handleClose` closes over is `onOpenChange`, and the listener
is re-registered whenever `open` toggles. But the suppression hides a
future regression — if the effect ever stops depending on `open`, the
listener would go stale. Cleaner: hoist `handleClose` into a
`useCallback` whose dependency is `onOpenChange`, then list it in the
effect deps and drop the suppression.

### F3 — `DisclosureRow` `importantForAccessibility="no-hide-descendants"` on the chevron
**File:** `components/MobilePremium/DisclosureRow.tsx:104`
**Severity:** low (a11y / portability).

`"no-hide-descendants"` is a valid Android value but is not in the
TypeScript type for `importantForAccessibility` on web / iOS. The
prop already carries `accessibilityElementsHidden`, which is the
cross-platform "hide from screen readers" signal. Either drop the
`importantForAccessibility` prop entirely (relying on
`accessibilityElementsHidden` alone) or also include the matching
`accessibilityElementsHidden` on the body container when open, so the
contract is uniform across platforms.

### F4 — `CalendarGrid` doc-comment / implementation mismatch on container role
**File:** `components/MobilePremium/CalendarGrid.tsx:16-24` vs `:178`
**Severity:** low (a11y / doc drift).

The file header documents an accessibility contract that says
"Container is `role="grid"`" and "Each week row is `role="row"`." The
implementation uses `accessibilityRole="list"` on the container and
does not set `role="row"` on the week rows. RN's
`AccessibilityRole` enum does not include `grid` or `row`, so the
implementation's fallback to `list` is reasonable — but the
documentation should say so rather than claiming `role="grid"` /
`role="row"`. The design-system doc inventory row
(`docs/architecture/mobile-premium-design-system.md:248`) repeats the
same `role="grid"` / `role="row"` claim. Either retune the docs to
describe what the implementation actually does, or layer web
`aria-role="grid"` / `aria-role="row"` via host attributes when the
consumer wants the strict grid semantics (the same approach the
showcase already documents for `tabpanel` at `showcase.tsx:772-777`).

### F5 — `ActivityGrid.getLevel` callback signature
**File:** `components/MobilePremium/ActivityGrid.tsx:64-66`
**Severity:** info (API surface note).

The custom-level resolver receives
`Readonly<Pick<ActivityGridCell, 'date' | 'value' | 'label'>>` and
returns `ActivityGridLevel` (clamped to 0..4 internally). The Readonly
+ Pick combination is good — it signals that resolvers cannot mutate
the cell. The clamp is silent; a resolver that returns 7 sees no
error. Consider documenting the clamp behavior in the JSDoc (currently
the only mention is "Return is clamped to 0..4") and/or offering a
dev-mode `__dev__` warning when the resolver returns out-of-range, to
catch the typical bug class early without changing the runtime
contract.

### F6 — Generic prop-naming consistency
**Severity:** info.

`accentColor` (StatCard, MobileSheet, DatePickerField, SegmentedControl,
OfflineBanner via `variantAccent`, CalendarGrid, CarouselTutorial,
Wizard, ActivityGrid via implicit `colors.brand`) is the canonical
override slot name and is consistently used. `color` (ProgressRing,
SegmentedProgress via `trackColor` / per-segment `color`) and `ringColor`
(Avatar) name the same concept differently. Not a bug — the
per-primitive naming tracks the per-primitive semantics (a ring color
is conceptually different from an accent color) — but worth deciding
deliberately during the mirror pass whether the consumer's design
system uses one term or three.

## 6. Accessibility, motion, theme, and responsive findings

### F7 — Product-specific copy leaks in the showcase (P1)
**Files:**
- `components/MobilePremium/showcase.tsx:619` — MobileStepper demo:
  `unitLabel="reps"`.
- `components/MobilePremium/showcase.tsx:784` — SegmentedControl
  `variant="tabs"` demo panel copy:
  `'Sets panel: 3 sets × 8 reps at 75% 1RM.'`.
- `components/MobilePremium/showcase.tsx:786` — same demo, second
  panel: `'Notes panel: form felt clean on the third set.'`.
- `components/MobilePremium/showcase.tsx:1206` — RevealMask demo
  private text:
  `'Private: 8 reps at 75% 1RM. Form felt clean on the third set.'`.
- `components/MobilePremium/showcase.tsx:631` (adjacent context) —
  MobileCheckboxItem helper text: `"Get reminded when it's time to
  work out."`.
- `components/MobilePremium/showcase.tsx:371` — SegmentedControl tab
  state union: `'sets' | 'notes' | 'history'`.

**Severity:** P1 for mirror-readiness. The shell's *production code*
is clean. The leak is confined to the dev-only showcase's demo copy.
But the showcase IS the visual source of truth — a mirror planning
pass will diff the showcase first, and the consumer's first impression
of "what arqavellum thinks a primitive is for" comes from the demo
copy. The `e43918c` commit neutralized the *production source*
comments (`MobileStepper.tsx`, `ActivityGrid.tsx`, `MobileDialog.tsx`)
but did not touch the showcase call sites.

This is the single most mirror-relevant finding. The neutralization
pass should be completed in arqavellum *before* the consumer mirrors,
so the consumer doesn't have to decide whether to port the demo copy
as-is or rewrite it.

Replacement suggestions (generic-neutral):
- MobileStepper demo: `unitLabel="units"` or `unitLabel="items"`.
- SegmentedControl tab demo: use `'summary' | 'details' | 'activity'`
  with copy like `'Summary panel: 3 entries logged today.'` / `'Details
  panel: notes recorded against each entry.'` / `'Activity panel: last
  completed 5 days ago.'`.
- RevealMask demo: `'Private: account reference AC-1234. Keep between
  you and your accountant.'`.
- MobileCheckboxItem helper text: `"Get reminded when something needs
  your attention."`.

### F8 — `.husky/pre-commit` does not run SB2 (P1)
**File:** `.husky/pre-commit`
**Severity:** P1 — wire-level drift between docs and enforcement.

`CLAUDE.md` (line 24) and `docs/architecture/mobile-premium-design-system.md`
(§10) both state the gate is "12 structural audits + `tsc --noEmit` +
structural ESLint that run on every `git commit` via `.husky/pre-commit`."
`ARCHITECTURE.md` S20 carries the same claim ("12 audits"). The
`package.json` `lint:structure` script does include all 12 audits.

The husky hook runs only 11. The hook executes
`audit-barrels`, `audit-data-layer`, `audit-state`, `audit-security`,
`audit-logging-errors`, `audit-ui-theme`, `audit-component-quality`,
`audit-testing-types`, `audit-pattern-compliance`,
`audit-runtime-resilience`, `audit-screen-body`, then structural ESLint,
then `tsc`. It is missing `scripts/audit-mobile-content-width.ts`. The
header comment in the hook still says "10 structural audits" (pre-SB1
wording — itself stale).

Effect: a developer who commits without first running
`bun run lint:structure` will not run SB2. The MobileSelect
false-negative class that motivated SB2 — sheet panel missing the
policy spread — would land in `main` unchallenged by the gate. CI that
runs `bun run lint:structure` would still catch it, but the
"commit-time" guarantee the docs claim is not actually in effect.

Two parallel fixes are required:
1. Add an `audit-mobile-content-width` block to `.husky/pre-commit`
   after the `audit-screen-body` block.
2. Update the hook's header comment to "12 structural audits" to
   match CLAUDE.md / ARCHITECTURE.md / the design-system doc.

### F9 — `package.json` description still says "10-audit"
**File:** `package.json:5`
**Severity:** low (doc drift).

`"description": "Clean, domain-agnostic PWA-first Expo+Tamagui+Supabase+Bun starter with a 47-pattern architecture constitution, 10-audit pre-commit gate, and a light-default MobilePremium design system."`

Should read "12-audit pre-commit gate" to match CLAUDE.md and
ARCHITECTURE.md. Cosmetic, but it's the only place in the repo that
still prints the audit count as a number to a human reading package
metadata (npm / Vercel project page / IDE hover), so worth fixing in
the same change that lands the F8 fix.

### F10 — `ActivityGridPreview` `ColumnSelector` uses `radio` + `selected`
**File:** `components/MobilePremium/ActivityGridPreview.tsx:94-95`
**Severity:** low (internal contract drift).

The `FilterChip` header
(`components/MobilePremium/FilterChip.tsx:5-12`) and the design-system
doc inventory row (§244) articulate the kit's accessibility-state
contract: `accessibilityRole="radio"` pairs with
`accessibilityState.checked`, not `.selected`. The
`ColumnSelector` pill in the ActivityGrid preview uses
`accessibilityRole="radio"` + `accessibilityState={{ selected: active }}`,
which contradicts that contract.

This is a dev-only preview host (not shipped to consumers as a
primitive — `ActivityGridPreview` is exported from the barrel but is
only used at `/dev/premium`). Fix is one-line: change the state key to
`checked`. Worth doing during the neutrality pass so the kit's own
dev surface models the contract its production primitives enforce.

### F11 — `MobileSheet` scrim uses `rgba(0, 0, 0, 0.5)` literal
**File:** `components/MobilePremium/MobileSheet.tsx:166`
**Severity:** low (S7 audit scope note).

`scrim: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }` is a hardcoded
color literal. `audit-ui-theme.ts` (S7) bans hardcoded hex colors;
the regex scope is `#[0-9a-fA-F]{3,8}` and does not match `rgba(...)`.
So this literal passes the gate today. It is also visually correct for
a modal scrim across both light and dark themes (black at 50% alpha
reads as "scrim" against any backdrop).

Not a violation. Worth noting because (a) it's the only color literal
in the intake that isn't routed through `useAppTheme()` or
`constants/theme.ts`, and (b) if S7 ever widens to ban `rgba()`
literals, this site would newly fail. Capture as a tracked exception
in the audit's known-limitations section if/when S7 widens, or
promote the scrim color to a theme token (`theme.colors.light.mobilePremium.scrim`
+ dark sibling) if a future design pass wants the scrim tunable.

### F12 — RevealMask blur branch also uses `rgba(0, 0, 0, 0.35)`
**File:** `components/MobilePremium/RevealMask.tsx:95`
**Severity:** low (same class as F11).

The blur variant's web backdrop-filter layer uses
`backgroundColor: 'rgba(0, 0, 0, 0.35)'`. Same observation as F11:
passes S7 today, visually reasonable, the only non-token color in the
primitive. Document as an audit-known limitation or promote to a theme
token.

### F13 — Mobile web keyboard / focus management in `MobileSheet` and `MobileDialog`
**Severity:** info (no finding — recorded for mirror completeness).

Both portals close on Escape (web). Neither traps focus. For the
shell's stated use cases (sheet hosting a date picker / select / brief
form; dialog hosting a confirm) this is acceptable — focus return and
trapping are correctly deferred to the consumer's hosted content. The
`CarouselTutorial` and `Wizard` composition helpers, which render
inline (no portal), also do not manage focus, which is correct for
their inline-flow semantics. A consumer building a complex form inside
a `MobileSheet` should add focus management themselves; this should be
documented in the design-system inventory rows for `MobileSheet` /
`MobileDialog` during the mirror pass.

### F14 — Reduced-motion coverage
**Severity:** info (positive finding).

Every motion-emitting primitive in the intake honors
`prefers-reduced-motion`:
- `DisclosureRow` — chevron rotation collapses to duration 0 via
  `useReducedMotion()` (the only primitive in the intake that consults
  the hook directly).
- `CarouselTutorial`, `Wizard` — composed from `Crossfade`, which
  already collapses to fade-only under reduced motion (documented in
  §2.4 of the design-system doc).
- `MobileSheet` — uses RN `Modal` `animationType="slide"` / `"fade"`,
  which are OS-level and respect the OS reduce-motion setting
  automatically. No shell-level work to do.
- `StatCard`, `FilterChip`, `SegmentedControl`, `EmptyState`,
  `RevealMask` — use `usePressedStyle()`, which collapses to
  opacity-only under reduced motion (cross-cutting shared layer).
- `ActivityGrid`, `CalendarGrid`, `DatePickerField`, `Avatar`,
  `OfflineBanner`, `ProgressRing`, `SegmentedProgress`,
  `FilterChipGroup` — no animation by construction (static or
  state-driven instant swap).

### F15 — Light / dark token coverage
**Severity:** info (positive finding).

Every visual primitive in the intake resolves colors via `useAppTheme()`
returning `colors.*` for the active palette, with `accentColor` /
`ringColor` / `maskColor` / `color` / `trackColor` overrides where the
primitive legitimately needs a consumer-tunable slot. No
`theme.colors.light.X` indexing by mode in any primitive (the S7
anti-pattern). `ActivityGrid`'s level ramp is derived from
`colors.brand` (alpha-multiplied at runtime) so it tracks the brand
override in both modes. `MobileSheet`'s scrim (F11) and `RevealMask`'s
blur layer (F12) are the only literal color sites; both are
palette-invariant by design.

### F16 — Responsive / safe-area behavior
**Severity:** info (positive finding).

- Portal primitives (`MobileSheet`, `MobileDialog`, `MobileSelect`)
  spread `MOBILE_CONTENT_WIDTH_STYLE` / `MOBILE_DIALOG_WIDTH_STYLE` on
  their panel-named StyleSheet entry. SB2 enforces this by naming
  convention.
- `ActivityGrid` measures its own container via `useContainerQuery`
  (post-parent-padding width) and adapts cell size + column count to
  the measured width. Calendar mode is compact-aware: below the
  feasible threshold it first reduces gap toward `minGap`, then
  reduces cell size below `cellMinSize`. `maxRows` caps the grid
  height by dropping leading rows.
- `SegmentedControl` and `FilterChipGroup` are width-agnostic and
  compose correctly inside any container.
- `DatePickerField` and `MobileSheet` use the OS safe areas via the
  host's `SafeAreaView` wrapper — neither primitive applies safe-area
  insets directly, which is correct (the safe-area insets are owned by
  the screen shell, not by individual primitives).
- The 490px height-budget test is not directly exercised by any of
  the new primitives (none of them are full-screen surfaces). The
  intake does not regress the budget.

## 7. Showcase, barrel, documentation, test, and audit coverage

### Showcase (`app/dev/premium.tsx` + `components/MobilePremium/showcase.tsx`)

Every new primitive is registered in the showcase:

| Primitive | Showcase section | Notes |
|---|---|---|
| ActivityGrid | "Activity Grid (calendar + matrix)" via `<ActivityGridPreview />` | Demonstrates all four states. |
| Avatar | "Avatar (image or initials)" | Multiple sizes, shapes, presence values. |
| CalendarGrid | (transitive via DatePickerField) | Not registered as a standalone demo. |
| CarouselTutorial | "Carousel tutorial (NOT stories)" | Three slides, onComplete wired. |
| DatePickerField | "Date picker (YYYY-MM-DD in/out)" | min / max / helperText. |
| DisclosureRow | "Disclosure (expand/collapse rows)" | Three rows, one open by default. |
| EmptyState | "Empty state" | Three variants (with action, title-only, compact). |
| FilterChip / FilterChipGroup | "Selection — filter chips" | All three role modes + wrap:false inside a horizontal ScrollView. |
| MobileSheet | "Sheet (bottom or top anchored)" | Demo opens the sheet at the bottom of the showcase. |
| OfflineBanner | "Offline / sync banner" | All three variants. |
| ProgressRing | "Progress ring (static v1)" | sm / md / lg with centered labels. |
| RevealMask | "Reveal mask (visual privacy only)" | Tap-to-reveal + re-mask button. |
| SegmentedControl | "Selection — segmented control" | `selection` / `tabs` / `chromeless` variants. |
| SegmentedProgress | "Segmented progress" | Three segments with `showLabels`. |
| StatCard | "Stat cards" | accent + plain + outline (with `onPress`). |
| Wizard | "Wizard (thin composition)" | Three steps, Back / Continue wired. |

**F17 — CalendarGrid is the only new primitive without an explicit showcase row.**
**Severity:** low. CalendarGrid is exercised transitively through
DatePickerField, so it's visible at `/dev/premium`. The
design-system doc inventory describes CalendarGrid as "available as a
standalone primitive" — if that's a real offer, the showcase should
register a standalone demo so consumers can see it in isolation. If
it's only intended to be used through DatePickerField, the
"available as standalone" wording in the inventory row should soften.

### Barrel (`components/MobilePremium/index.ts`)

All 17 new primitives have a named export and a re-exported type alias
in the barrel. The barrel compiles. The showcase correctly bypasses
the barrel for primitive imports (`showcase.tsx:30-33`) with a comment
explaining the circular-dependency mitigation; this is the
canonical pattern documented by S5.

### Documentation (`CLAUDE.md`, `ARCHITECTURE.md`, `docs/architecture/mobile-premium-design-system.md`)

- `CLAUDE.md` pre-commit table correctly lists 12 audits including
  SB1 and SB2. Content-width policy section (§"Content-width policy")
  is the canonical short reference.
- `ARCHITECTURE.md` S20 row + body updated to 12 audits. The
  namespace note ("audit codes and constitution pattern codes are
  separate namespaces; SB1 already established this") is the right
  framing.
- `docs/architecture/mobile-premium-design-system.md` §3 inventory has
  a row for every new primitive; §10.1 content-width policy is the
  long-form spec.

**F4** (above) covers the only doc / implementation mismatch found
(the CalendarGrid role contract). No other drift.

### Tests (`__tests__/`)

17 dedicated component test files + 1 hooks test + 1 utils test + 1
audit-script test. Total: 532 / 532 pass
(`bun run test:run`, matches the `e43918c` commit message claim).

**F18 — CalendarGrid has no dedicated test file.**
**Severity:** low. CalendarGrid is exercised transitively via
`__tests__/components/DatePickerField.test.tsx` (9 tests, including
the calendar interaction path). The primitive has the most complex
a11y contract in the intake (grid / row / button roles; min/max
enforcement; today affordance; month navigation) and the most complex
local-timezone semantics. A dedicated test file would be the right
place to pin: weekday alignment, min/max day disabling, today-button
edge case (today is out-of-range → button should be disabled),
negative-UTC-offset selection round-trip (select 2026-07-19 →
re-render → still 2026-07-19, not 2026-07-18), and month-navigation
boundaries.

### Audit wiring

**F8 (P1, repeated)** — `.husky/pre-commit` is missing the SB2 block.
SB2 runs via `bun run lint:structure` (manual or CI) but NOT via the
commit hook. This is the load-bearing wire-level gap.

Otherwise the audit wiring is clean:
- `audit-mobile-content-width.ts` is correctly added to
  `package.json` `lint:structure`.
- `audit-component-quality.ts` correctly lists `MobileSheet.tsx` in
  `C2_EXEMPT_FILES` (was MobileDialog-only before).
- `audit-screen-body.ts` correctly reads `CONTENT_WIDTH_MODE` and
  skips when fluid.
- `audit-mobile-content-width.ts` reads the same `CONTENT_WIDTH_MODE`
  binding — single source of truth verified by the policy-mode test
  cases in `__tests__/scripts/audit-mobile-content-width.test.ts`.

### Pre-commit gate output (as audited)

```
$ bun run lint:structure
✓ PASS: No barrel import violations found.
✓ PASS: No data layer violations found.
✓ PASS: No state management violations found.
✓ PASS: No security violations found.
✓ PASS: No logging or error-handling violations found.
✓ PASS: No UI/theme violations found.
✓ PASS: No component-quality violations found.
✓ PASS: No testing/type violations found.
✓ PASS: No pattern-compliance violations found.
✓ PASS: No runtime-resilience violations found.
✓ PASS: No screen-body violations found.
✓ PASS: No portal-content-width violations found.

$ bunx tsc --noEmit
(0 errors, exit 0)

$ bun run test:run
Test Files  28 passed (28)
     Tests  532 passed (532)
```

All gates pass on the as-audited tree.

## 8. Potential future mirror surface (assessment only; no manifest)

This section identifies the file set a future Arman Fit mirror-planning
pass would need to evaluate. It does NOT produce a manifest, does NOT
propose copy-over rules, and does NOT inspect armandotfit. The
arqavellum-side surface only.

### Tier A — Pure shell, mirror-eligible as-is (subject to F7 / F8 fix-first)

All 17 new primitive source files under `components/MobilePremium/`:

`ActivityGrid.tsx`, `ActivityGridPreview.tsx`, `Avatar.tsx`,
`CalendarGrid.tsx`, `CarouselTutorial.tsx`, `DatePickerField.tsx`,
`DisclosureRow.tsx`, `EmptyState.tsx`, `FilterChip.tsx`,
`FilterChipGroup.tsx`, `MobileSheet.tsx`, `OfflineBanner.tsx`,
`ProgressRing.tsx`, `RevealMask.tsx`, `SegmentedControl.tsx`,
`SegmentedProgress.tsx`, `StatCard.tsx`, `Wizard.tsx`.

Plus touched shell primitives that received policy-spread migrations:
`MobileDialog.tsx`, `MobileSelect.tsx`, `MobileActionFooter.tsx`,
`MobileAlert.tsx`, `MobileHeader.tsx`, `MobileHomeHeader.tsx`,
`MobileInput.tsx`, `MobilePrimaryButton.tsx`,
`MobileSectionEyebrow.tsx`, `MobileSettingsRow.tsx`,
`MobileStepRail.tsx`, `MobileSurface.tsx`, `MobileStepper.tsx`.

Plus the shared layer: `components/premium/shared/Motion.tsx`,
`components/premium/shared/atmospherePalettes.ts`,
`components/premium/shared/index.ts`, `MobileMotion.tsx`.

### Tier B — Foundation (shell-owned, mirror as-is)

- `components/MobilePremium/index.ts` — barrel.
- `components/MobilePremium/showcase.tsx` — showcase. **Mirror only
  after F7 is fixed.** Otherwise the consumer would inherit the
  fitness-flavored demo copy.
- `components/primitives/LoadingOverlay.tsx` — refactored to compose
  MobileDialog.
- `components/primitives/Toast.tsx` — policy spread applied.
- `constants/styles.ts` — `CONTENT_WIDTH_MODE` source of truth +
  derived spreads.
- `constants/index.ts`, `hooks/useActivityGridLayout.ts`,
  `hooks/useContainerQuery.ts`, `utils/activityGrid.ts`,
  `utils/date-helpers.ts` — supporting foundation.

### Tier C — Audit + test infrastructure (mirror as-is)

- `scripts/audit-mobile-content-width.ts` — new audit.
- `scripts/audit-component-quality.ts` — `C2_EXEMPT_FILES` update.
- `scripts/audit-screen-body.ts` — `CONTENT_WIDTH_MODE` awareness.
- `__tests__/scripts/audit-mobile-content-width.test.ts` — 22 cases.
- `__tests__/components/{ActivityGrid,Avatar,CarouselTutorial,DatePickerField,
  DisclosureRow,EmptyState,FilterChip,FilterChipGroup,LoadingOverlay,
  MobileSheet,OfflineBanner,ProgressRing,RevealMask,SegmentedControl,
  SegmentedProgress,StatCard,Wizard}.test.tsx` — 17 files.
- `__tests__/hooks/useActivityGridLayout.test.ts`,
  `__tests__/utils/activityGrid.test.ts`.
- `__tests__/setup.ts`, `__mocks__/react-native.ts`,
  `__mocks__/react-native-svg.ts`,
  `__mocks__/@react-native-community/datetimepicker.ts`.
- `vitest.config.ts` — aliases for the new mocks.

### Tier D — Documentation (mirror with light retargeting)

- `CLAUDE.md` — pre-commit table, content-width policy section.
- `ARCHITECTURE.md` — S20 row.
- `docs/architecture/mobile-premium-design-system.md` — full §3
  inventory expansion + §10.1 content-width policy.
- `app/dev/premium.tsx` — route (unchanged).

A consumer that already has an older snapshot of arqavellum would
re-sync these doc sections verbatim; a fresh consumer clones arqavellum
and gets them automatically.

### Tier E — Mirror-prep work to land in arqavellum first

The mirror planning pass should not run against a tree with known
leaks. Before opening the mirror-planning findings branch in
arqavellum, land (at minimum):

1. **F7 — showcase neutrality** (P1). Without this, the mirror
   planning pass is diffing against a tree whose showcase still
   contains fitness demo copy. The consumer's mirror evaluation will
   conflate "shell primitive is good" with "shell primitive is
   fitness-flavored" — exactly the conflation the neutrality pass in
   `e43918c` set out to prevent.
2. **F8 — husky pre-commit wiring** (P1). The SB2 audit is the
   load-bearing prevention for the MobileSelect false-negative class.
   A consumer cloning arqavellum after the intake inherits the gap.
3. **F4 — CalendarGrid role-contract doc fix** (low). Closes the
   only doc-vs-implementation mismatch in the intake.
4. **F9 — package.json audit-count description** (low). One-word fix.
5. **F10 — ActivityGridPreview a11y state key** (low). One-line fix.

The remaining findings (F1, F2, F3, F11, F12, F13, F17, F18) are
quality / hygiene / coverage items that can land during or after the
mirror planning pass without blocking it.

### Non-goals for this report

- No mirror manifest is produced.
- No files are copied.
- `armandotfit` is not inspected; the consumer-side adaptation
  contract is referenced only at the level of "what the shell
  exposes," not "what the consumer currently has."
- No brand identity (color, icon, slug, bundle ID, copy) is proposed
  or evaluated.
- No estimate of mirror effort or sequencing is offered.
- No commit message, branch name, or push protocol for the mirror
  pass is drafted — that is the next report's responsibility, and
  only if this report's findings are accepted.

---

## Validation performed

| Step | Command | Result |
|---|---|---|
| Working tree clean | `git status` | clean |
| Branch creation | `git checkout -b chore/report-arqavellum-post-intake-audit` | success |
| Structural audits | `bun run lint:structure` | 12/12 pass |
| Typecheck | `bunx tsc --noEmit` | 0 errors |
| Test suite | `bun run test:run` | 532/532 pass |
| Husky audit-count claim | `grep audit-mobile-content .husky/pre-commit` | no match (confirms F8) |
| Product-leak scan | `grep -rni 'reps\|workout\|exercise\|armandotfit\|...' components/MobilePremium` | 5 hits in `showcase.tsx` only (confirms F7) |
| Public-discipline scan | `grep -rni 'qep\.to\|quickextenderpro\|stykxx\|zkqnenh\|oidotsh'` (excl. `bun.lock`) | 0 hits |

## Open questions

1. **CalendarGrid as standalone primitive.** Is the "available as a
   standalone primitive" wording in the design-system doc inventory
   row a real offer? If yes, F17 (showcase row) and F18 (dedicated
   test file) should be addressed. If no, soften the wording.
2. **Scrim color tokens.** Are F11 / F12 acceptable as audit-known
   limitations, or should the scrim / blur-mask colors be promoted to
   `theme.colors.{light,dark}.mobilePremium` tokens so a future design
   pass can tune them?
3. **SB2 in CI vs husky.** Confirm CI runs `bun run lint:structure`
   (not just husky). If CI runs husky directly, F8 is more severe
   than "P1" because CI also misses SB2.

## Non-goals

- No production code is modified.
- No tests are added or modified.
- No configuration is modified.
- No documentation is modified (this report excepted).
- No migrations are touched.
- No remote services are contacted.
- No push is performed. The report commits locally on the findings
  branch; push requires explicit per-push confirmation per the
  workspace push protocol.
