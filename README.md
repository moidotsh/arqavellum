# Arqavellum

> A clean, domain-agnostic PWA-first Expo+Tamagui+Supabase+Bun starter repo. Ships a 47-pattern constitution, 10-audit pre-commit gate, repository pattern, Zustand + React Query, and barrel exports — retuned for **light-default, dark-opt-in** + **PWA-first (native export is consumer extension)** + **email/password auth**. Clone it, drop in your domain, ship.

## What arqavellum is

- A **starter**, not a framework. You clone it, you own the copy, you modify freely. (Like `create-next-app`, like `expo-template-*`.)
- A **47-pattern architecture constitution**: 10-audit pre-commit gate, repository pattern, Zustand + React Query, barrel exports, premium Mobile design system.
- **Light-default, dark-opt-in.** Both palettes ship in `constants/theme.ts`. The user picks via Settings (`light` / `dark` / `system`); preference persists across sessions; `system` defers to OS `prefers-color-scheme`. Adding a *third* mode (e.g. `dim`) is a deliberate consumer extension that requires retuning every MobilePremium primitive.
- **PWA-first.** Static web export is the supported default. Native iOS/Android export is an intentional consumer extension — arqavellum ships native scaffolding (`icon`, `ios`, `android`, `expo-splash-screen` plugin in `app.config.ts`) + 3 placeholder PNGs at `./assets/`. The consumer adds `eas.json`, EAS Build config, brand PNGs, their own iOS bundle identifier + Android application/package ID (replacing the `app.arqavellum` starter value), and platform validation before native release. Runtime manifest-injection block in `app/_layout.tsx` remains load-bearing for PWA installability.
- **Email/password auth by default.** Consumers needing PIN+device-UUID auth re-add the 4 PIN primitives + `audit-rpc-auth.ts` + a `verify_session` RPC as a customization (see `CLAUDE.md` → "When to add PIN auth").

## What arqavellum isn't

- A framework. There's no `npm install arqavellum`. You clone, you own.
- A multi-app monorepo. Each consumer is its own repo with its own git history.
- A third-color-mode starter (e.g. `dim`). Light and dark ship; a third mode requires retuning every MobilePremium primitive (the work is real — see `docs/architecture/mobile-premium-design-system.md`).
- A turnkey native release. Arqavellum ships PWA-first with native scaffolding (icon, iOS, Android, splash plugin in `app.config.ts` + placeholder PNGs at `./assets/`) so the groundwork is already in place; native is supported as an intentional consumer extension. Consumers wanting native complete the path on top — EAS config, brand PNGs, their own iOS bundle ID + Android application/package ID (replacing the `app.arqavellum` starter value), and platform validation. Web is the supported default.

## Quickstart

```bash
git clone github.com/moidotsh/arqavellum my-app
cd my-app
rm -rf .git && git init
```

Then:

1. Find-and-replace `arqavellum` → `my-app` in `package.json`, `app.config.ts`, `app.json`, `public/manifest.json`, `CLAUDE.md`.
2. Copy `.env.local.example` → `.env.local`, fill in your Supabase URL + anon key.
3. Replace `public/icons/` and `assets/` with your brand icons.
4. Override `theme.colors.light.brand` in `constants/theme.ts` to your brand color.
5. `bun install && bun run web`.
6. Visit `localhost:8081`. Visit `/dev/premium` to see the design system. Visit `/login`, `/register`, `/settings` to confirm the shell flows work.

The full consumer guide (with the PIN-auth extension path) is in `CLAUDE.md` → "How to consume".

## The architecture, in 30 seconds

```
Route (app/) → Hook (hooks/) → Service (services/) → Repository (utils/supabase/repositories/) → Supabase
                   ↑
              Zustand store (stores/) for client state
              React Query for server state
```

- **No direct Supabase calls outside repositories.** `audit-data-layer.ts` (S9) enforces this.
- **No `console.log` outside `utils/logger.ts`.** `audit-logging-errors.ts` (S11) enforces this.
- **No hardcoded hex colors.** `audit-ui-theme.ts` (S7) enforces this — use `theme.colors.light.*`.
- **No `setInterval` without `clearInterval`.** `audit-runtime-resilience.ts` (R4a) enforces this.

The full 47-pattern constitution lives in `ARCHITECTURE.md`. The 10-audit pre-commit gate is documented in `CLAUDE.md` → "Pre-commit checks".

## The design system

Arqavellum ships the MobilePremium kit — a mobile-first design system retuned for light. Four pillars:

1. **Calm air** — generous spacing, no visual noise.
2. **Considered motion** — every animation has a reason; `prefers-reduced-motion: reduce` is the default.
3. **Material surfaces** — hairline inner border + soft gradient + outer glow + tint. One surface treatment, applied consistently.
4. **The 490px height-budget test** — every screen must fit at 490px viewport height (iPhone SE compact) without scrolling for the primary action.

Canonical reference: `docs/architecture/mobile-premium-design-system.md`. The visual source of truth: `app/dev/premium.tsx` (the showcase — visit it on `localhost:8081/dev/premium`).

## Reference docs

| Doc | What it owns |
|---|---|
| `CLAUDE.md` | Repo operating context (invariants, pre-commit checks, consumer guide, doc maintenance). Auto-loads in Claude Code sessions at the arqavellum root. |
| `ARCHITECTURE.md` | The 47-pattern constitution. Every architectural decision is grounded here. |
| `docs/OWNERSHIP.md` | Claim-type → canonical-owner map. Settles "which doc owns X" disputes. |
| `docs/architecture/mobile-premium-design-system.md` | The MobilePremium kit (four pillars, primitive inventory, atmosphere palettes, gating policy). |
| `docs/architecture/pwa-installability.md` | The PWA installability contract (manifest, SW, runtime injection). |
| `docs/contributing.md` | How to evolve arqavellum itself (when to fix in arqavellum vs. in a consumer). |

## Stack

- Expo SDK ~54.0.x (web-only static export)
- React Native 0.81.x (New Architecture)
- React 19.x
- TypeScript ~5.9.x (strict)
- Tamagui 2.3.x
- Expo Router (latest on SDK 54)
- Reanimated ~4.1.x
- Supabase JS ^2.79.x
- Zustand ^5 + React Query ^5
- Zod ^4
- Vitest
- Bun

## License

MIT. Clone it, own it, ship it.
