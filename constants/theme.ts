// constants/theme.ts
// Arqavellum's canonical token palette. Light is the default surface; dark is
// opt-in (toggle via useAppTheme().setColorScheme('dark')). audit-ui-theme
// (S7) still enforces "no hardcoded hex" — both modes resolve through
// `theme.colors[colorScheme].*` via useAppTheme() (or a direct constants
// import).
//
// The `brand` slot is the single override point for consumers. Arqavellum ships
// with a neutral indigo default; the next consumer overrides to whatever they
// want. Everything else (grays, semantic status colors, surface tokens) stays
// domain-agnostic.
//
// Adding dark mode to a consumer's brand slot: arqavellum's `dark.brand` is
// slightly brighter than `light.brand` so it holds its own against a dark
// surface. A consumer overriding brand should override BOTH modes —
// `dark.brand*` is the brighter companion, not a derived shade.

import type { TextStyle } from 'react-native';

// TextStyle-shaped typography tokens. Typing these explicitly avoids the
// `fontWeight: string` widening that breaks spread-into-<Text> calls
// (RN's TextStyle.fontWeight is a union of string literals, not `string`).
type TypographyToken = Pick<
  TextStyle,
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'fontFamily'
  | 'fontVariant'
>;

// ── Type families ───────────────────────────────────────────────────────
// The optional display pair, hoisted so typography tokens can reference
// it inside the same object literal. A consumer whose design language is
// printed matter declares a display face (poster titles, hero figures,
// totals) and/or a mono face (every figure that reads as ledger output —
// prices, stock, dates, metrics, eyebrows); body/UI text stays the
// platform sans for legibility. Both default to undefined — the starter
// renders the platform sans everywhere, and every read below is a no-op
// until a consumer fills them, so declaring the axis never moves the
// default look.
//
// Self-hosting recipe (web): OFL/compatible files in `public/fonts/`
// (woff2 first, TTF fallback), the @font-face block in an id'd <style>
// in `index.html`, restored at runtime from `app/_layout.tsx` (static
// export strips <head> styles), plus <link rel="preload" as="font"
// crossorigin> lines — the build-time injector copies both into every
// exported route. Native extension: load the same files through
// expo-font instead of the <style> block.
export interface TypeFaces {
  /** Display face — poster titles, hero figures, totals. */
  display?: string;
  /**
   * Condensed position of the display face — for consumers whose
   * display face carries a width axis. Declared as a second
   * @font-face over the SAME variable file with `font-stretch` pinned:
   * one download, two families, and RN code never touches fontStretch
   * (which RN's TextStyle does not carry).
   */
  displayCondensed?: string;
  /** Mono face — ledger figures: prices, stock, dates, metrics, eyebrows. */
  mono?: string;
}

const FONTS = {
  display: undefined,
  displayCondensed: undefined,
  mono: undefined,
} as TypeFaces;

// ── Design dialect ──────────────────────────────────────────────────────
// The ONE family declaration. A consumer's design language is not four
// independent flags that must agree by convention — it is one dialect
// that presets every surface-language point below (atmosphere, drawer,
// toast, transition). Sub-points remain as explicit overrides: writing a
// literal `style` on any of them beats the preset, for consumers whose
// taste mixes deliberately.
//   • 'glass' (default) — the starter's own look: drifting aurora orbs,
//     the glass-scrim sheet drawer, the bordered-card toast, no route
//     transition.
//   • 'ink' — printed matter: flat air (no orbs), the InkPanel drawer,
//     the ink chit toast, and the ink route curtain. The curtain is
//     consumer-implemented machinery that READS the transition axis
//     below — the shell ships no transition primitive of its own (a
//     future one would read the same declaration).
const DIALECT = 'glass' as 'glass' | 'ink';
const DIALECT_PRESETS = {
  glass: { atmosphere: 'aurora', drawer: 'sheet', toast: 'card', transition: 'none' },
  ink: { atmosphere: 'flat', drawer: 'ink', toast: 'chit', transition: 'curtain' },
} as const;

export const theme = {
  colors: {
    // ── Light surface (default) ────────────────────────────────────────
    // Arqavellum's default surface. Every MobilePremium primitive defaults
    // to this palette unless the consumer flips `colorScheme` to 'dark'.
    light: {
      // UI element colors
      background: '#FFFFFF',
      backgroundAlt: '#F8F9FB',
      card: '#FFFFFF',
      cardAlt: '#F3F4F6',
      border: '#E5E7EB',

      // Card border colors for subtle definition (light-tuned: dark-on-light
      // hairline reads as a precision edge instead of a heavy outline).
      cardBorder: 'rgba(15, 23, 42, 0.06)',
      cardBorderHover: 'rgba(15, 23, 42, 0.12)',

      // Text colors. `textMuted` clears WCAG AA (4.5:1) on the DARKEST
      // light background it rides (backgroundDeep #F1F5F9 — the previous
      // slate #64748B measured 4.34 there; meta text, sublabels, and
      // eyebrows all read this token on that surface).
      text: '#0F172A',
      textMuted: '#5D6B7E',
      textSecondary: '#475569',

      // Interactive element colors — the `brand` slot.
      // Consumers override this whole block to match their identity.
      // Arqavellum default: neutral indigo (calm, professional, works for any
      // domain that hasn't picked a color yet).
      brand: '#4F46E5',
      brandHover: '#4338CA',
      brandPress: '#3730A3',
      brandMuted: 'rgba(79, 70, 229, 0.08)',
      brandSoft: 'rgba(79, 70, 229, 0.12)',
      buttonBackground: '#4F46E5',
      buttonBackgroundDisabled: 'rgba(79, 70, 229, 0.5)',

      // The brand slot's TEXT companion — the same hue adjusted until it
      // clears WCAG AA (4.5:1) as small text (10–15px labels, eyebrows,
      // links) on the paper surfaces. `brand` itself is a fill/large-type
      // slot: it needs 3:1 for fills, borders, and display type (≥19px
      // bold / ≥24px), not 4.5:1. Saturated brand hues (oranges, bright
      // greens) fail 4.5:1 as small text — those consumers darken
      // `brandText` here and keep `brand` for fills; the starter's indigo
      // already passes (6.3:1 on card), so the default mirrors `brand`
      // and nothing moves.
      brandText: '#4F46E5',

      // Brand-hue accent for content on the INK PLATE (the inverted
      // surface: drawer, chits, curtain). Light mode's plate is the
      // slate ink #0F172A — a lightened indigo reads on it (8.96:1).
      // Same companion discipline as brandText: one hue, adjusted for
      // its surface. NOT a second accent slot.
      brandOnInk: '#A5B4FC',

      // Semantic status colors (iOS-style — consistent across consumers).
      // Measured AA as TEXT: every hue here clears 4.5:1 on card AND on
      // backgroundDeep (the darkest light surface) — the vivid 500-level
      // hues this family once shipped measured 2.2–3.8:1 as small text.
      // Dark mode keeps the brighter hues (they measure 6–10:1 there).
      status: {
        success: '#047857',
        warning: '#B45309',
        error: '#B91C1C',
        info: '#2563EB',
      },

      // Re-export aliases for call sites that read `success` and `alert`
      // at the top level (alternative to `status.success` / `status.error`).
      success: '#047857',
      alert: '#B91C1C',

      // Text color for content rendered on top of the brand color slot
      // (e.g. MobilePrimaryButton label, selected-state check icon). Pure
      // white regardless of which brand hue the consumer picked — every
      // default brand shade is dark enough that white reads cleanly. A
      // consumer whose brand is BRIGHT (a saturated orange/yellow/green)
      // overrides this to a near-black ink instead — the label must clear
      // AA on the fill, and white never will there.
      textOnBrand: '#FFFFFF',

      // Secondary text on brand surfaces (uppercase eyebrows, helper lines,
      // chip sublabels). White at 0.85 alpha — preserves hierarchy against
      // `textOnBrand` while clearing WCAG AA on the brand hue. The
      // equivalent of `textSecondary` for brand-tinted surfaces.
      textOnBrandMuted: 'rgba(255, 255, 255, 0.85)',

      // Deeper background for full-bleed screens (auth, onboarding).
      // Light-mode interpretation: a faintly-cooler off-white that lets a
      // central card pop without losing the light feel.
      backgroundDeep: '#F1F5F9',

      // Text color variants. `textColors.muted` and `textMuted` are unified
      // (same value, both names) so consumers don't have to remember which
      // "muted" to use.
      textColors: {
        muted: '#5D6B7E',
        secondary: '#5D6B7E',
        tertiary: '#94A3B8',
      },

      // Icon background tints (semantic — darker hue on pale tint instead
      // of bright hue on dark).
      iconBackground: {
        blue: 'rgba(59, 130, 246, 0.12)',
        green: 'rgba(16, 185, 129, 0.12)',
        purple: 'rgba(168, 85, 247, 0.12)',
        orange: 'rgba(249, 115, 22, 0.12)',
        white: 'rgba(15, 23, 42, 0.06)',
      },

      // Glassmorphism (light). Backdrop is a near-solid pale tint instead
      // of dark smoked glass; borders are dark hairlines instead of light
      // bleed-through.
      glass: {
        background: 'rgba(255, 255, 255, 0.72)',
        backgroundLight: 'rgba(255, 255, 255, 0.55)',
        border: 'rgba(15, 23, 42, 0.08)',
        borderHighlight: 'rgba(15, 23, 42, 0.15)',
        borderHover: 'rgba(15, 23, 42, 0.12)',
        emptyInputBorder: 'rgba(15, 23, 42, 0.2)',
        panelBackground: 'rgba(255, 255, 255, 0.6)',
        inputBackground: 'rgba(15, 23, 42, 0.03)',
        inputFocusBackground: 'rgba(79, 70, 229, 0.05)',
      },

      // Alert background tint for error containers.
      alertBackground: 'rgba(239, 68, 68, 0.08)',

      // ── The categorical meter ramp ────────────────────────────────────
      // Six steps + a rim for consumers that DRAW quantities as
      // proportional meter segments (stacks, gauges, tallies). The rim
      // guarantees each step's edge on light grounds where the pale
      // steps fail raw 3:1. Values are the starter's family — consumers
      // retune freely; only the STRUCTURE syncs.
      meter: {
        step1: '#4338CA',
        step2: '#0E7490',
        step3: '#B45309',
        step4: '#15803D',
        step5: '#E7E5E4',
        step6: '#6B7280',
        rim: '#0F172A',
      },

      // ── The focus register ─────────────────────────────────────────────
      // A mode-independent surface family for "doing" surfaces — live
      // capture, active sessions, focus modes: dark in BOTH palettes
      // (an instrument, not a document). Consumers override the values;
      // the structure ships so focus-reading primitives (the chit
      // toast, curtains, focus screens) have one place to read. Not a
      // third color scheme — useAppTheme() still resolves two.
      focus: {
        background: '#0F1218',
        surface: '#171B24',
        surfaceAlt: '#1D2230',
        border: '#272E3F',
        text: '#F1F5FA',
        muted: '#93A0B4',
        signal: '#818CF8',
        onSignal: '#0F1218',
        track: '#232A3A',
        signalSoft: 'rgba(129, 140, 248, 0.16)',
      },

      // ── Mobile premium primitive kit tokens ───────────────────────────
      // Consumed by components/MobilePremium/*. Light-tuned tokens for
      // the kit's dark-mode siblings.
      //
      // Design rationale (see docs/architecture/mobile-premium-design-system.md):
      //   • Hairline inner border = a 1px line at low opacity DARK. Reads as
      //     a precision edge against a light surface (inverse of the dark
      //     kit's low-opacity white).
      //   • Surface gradient = top ~3% darker than bottom, suggesting soft
      //     directional light hitting a physical object from above.
      //   • Soft glow = the outer shadow identity of a surface. One value,
      //     applied consistently.
      //   • No Android Chrome fallback tint — on a light surface, the
      //     default ~4% dark alpha reads as intended; no saturate() wash-out
      //     failure mode to compensate for.
      mobilePremium: {
        // Hairline border (inner) — dark-on-light at low opacity.
        hairlineBorder: 'rgba(15, 23, 42, 0.08)',
        hairlineBorderStrong: 'rgba(15, 23, 42, 0.15)',

        // Surface gradient stops — top slightly darker than bottom by ~3%
        // luminance. Dark alpha over light surface composites correctly.
        surfaceGradientTop: 'rgba(15, 23, 42, 0.03)',
        surfaceGradientBottom: 'rgba(15, 23, 42, 0.005)',

        // Soft outer glow — the surface's shadow identity (web only).
        // Lighter than the dark kit's glow because the surface is already
        // bright; we want a soft elevation cue, not a heavy vignette.
        surfaceGlow: '0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',

        // The instrument lift — a reserved, heavier shadow for the ONE
        // docked instrument a screen may carry (a logger, a composer):
        // the flat surface language stays, and a single physical object
        // is allowed to sit ON it. Nothing else should use this.
        instrumentShadow:
          '0 -2px 6px rgba(15, 23, 42, 0.10), 0 -12px 32px rgba(15, 23, 42, 0.14)',

        // Backdrop blur for web (saturate is safe on light surfaces).
        surfaceBackdropBlur: 'blur(24px) saturate(160%)',

        // Android Chrome fallback — near-solid surface + milder blur.
        // Near-opaque because Android Chrome renders saturate() poorly;
        // milder blur to avoid compounding the visual artifact.
        androidChromeSurfaceBackground: 'rgba(255, 255, 255, 0.88)',
        androidChromeSurfaceBlur: 'blur(12px)',

        // Nav drawer — the page scrim uses a milder blur than the surface
        // glass (it covers the whole page; a heavy blur smears everything)
        // and the panel carries a right-edge depth shadow. The shadow lives
        // on the panel, not the scrim, so its upward bleed lands off-screen
        // above the viewport instead of darkening the brand cutout.
        navScrimBackdropBlur: 'blur(8px)',
        // Scrim hex alpha over backgroundDeep. Light mode runs one step
        // heavier than dark: the panel floats on white content, and the
        // veil needs real separation to read as depth, not fog.
        navScrimAlpha: 'dd',
        navPanelShadow: '4px 0 32px rgba(0, 0, 0, 0.36), 0 2px 8px rgba(0, 0, 0, 0.2)',

        // Faint vignette to settle the atmosphere into the edges (web).
        // Much softer than the dark kit's vignette — a whisper of depth,
        // not a visible darkening.
        atmosphereVignette: 'inset 0 0 160px 60px rgba(15, 23, 42, 0.04)',

        // Rail (progress) — fill travels across a 2px track.
        railTrack: 'rgba(15, 23, 42, 0.08)',
        railFillShadow: '0 0 8px currentColor',
      },
    },

    // ── Dark surface (opt-in) ──────────────────────────────────────────
    // Mirror of `light` with every key retuned for dark surfaces. Active
    // when the consumer calls `useAppTheme().setColorScheme('dark')` (or
    // when system preference resolves to dark — see ThemeProvider's
    // detection logic). The structural shape MUST match `light` so
    // `theme.colors[colorScheme].*` is type-safe in TS.
    dark: {
      // UI element colors — dark surfaces. Slightly cooler than pure
      // charcoal to feel "calm dark" instead of "OLED black".
      background: '#0B0F19',
      backgroundAlt: '#111827',
      card: '#161E2E',
      cardAlt: '#1E293B',
      border: '#334155',

      // Card border colors (dark-tuned: light-on-dark hairline reads as
      // a precision edge against the dark surface).
      cardBorder: 'rgba(226, 232, 240, 0.08)',
      cardBorderHover: 'rgba(226, 232, 240, 0.15)',

      // Text colors — inverted from light.
      text: '#F1F5F9',
      textMuted: '#94A3B8',
      textSecondary: '#CBD5E1',

      // Interactive element colors — the `brand` slot. Brighter than
      // light's brand so the accent holds its own against the dark
      // background. Consumers override BOTH `light.brand*` and
      // `dark.brand*` (the two are independent — `dark` is not derived).
      brand: '#6366F1',
      brandHover: '#818CF8',
      brandPress: '#A5B4FC',
      brandMuted: 'rgba(99, 102, 241, 0.16)',
      brandSoft: 'rgba(99, 102, 241, 0.20)',
      buttonBackground: '#6366F1',
      buttonBackgroundDisabled: 'rgba(99, 102, 241, 0.4)',

      // Text companion of `brand` (see `light.brandText`). Brightened the
      // same way `brandHover` is — small text on dark surfaces needs MORE
      // contrast against the surface, not less. The starter's dark brand
      // already measures 5.6:1 on `card`, so the default simply mirrors
      // the brightened step; a saturated dark-mode brand brightens this
      // further until it clears 4.5:1.
      brandText: '#818CF8',

      // Brand-hue accent for the INK PLATE (see `light.brandOnInk`).
      // Dark mode's plate is bone #F1F5F9 — a deepened indigo reads on
      // it (9.07:1).
      brandOnInk: '#3730A3',

      // Semantic status colors — brightened for dark contrast.
      status: {
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#60A5FA',
      },

      // Aliases matching `light` (kept in sync across both palettes).
      success: '#34D399',
      alert: '#F87171',

      // Text on brand — stays white; the dark-mode brand is bright enough
      // that white reads cleanly. Consumers with a very pale brand may
      // want to override this to '#0B0F19'.
      textOnBrand: '#FFFFFF',

      // Secondary text on brand — same alpha treatment as `light.textOnBrandMuted`.
      textOnBrandMuted: 'rgba(255, 255, 255, 0.85)',

      // Deeper background for full-bleed screens (auth, onboarding) —
      // darker still so a central card pops.
      backgroundDeep: '#050810',

      // Text color variants.
      textColors: {
        muted: '#94A3B8',
        secondary: '#CBD5E1',
        tertiary: '#64748B',
      },

      // Icon background tints — dark-tuned (brighter hue on dark tint).
      iconBackground: {
        blue: 'rgba(96, 165, 250, 0.18)',
        green: 'rgba(52, 211, 153, 0.18)',
        purple: 'rgba(192, 132, 252, 0.18)',
        orange: 'rgba(251, 146, 60, 0.18)',
        white: 'rgba(226, 232, 240, 0.08)',
      },

      // Glassmorphism (dark). Retuned from light: backdrop is smoked
      // glass instead of frosted white; borders are light hairlines.
      glass: {
        background: 'rgba(22, 30, 46, 0.72)',
        backgroundLight: 'rgba(22, 30, 46, 0.55)',
        border: 'rgba(226, 232, 240, 0.08)',
        borderHighlight: 'rgba(226, 232, 240, 0.18)',
        borderHover: 'rgba(226, 232, 240, 0.12)',
        emptyInputBorder: 'rgba(226, 232, 240, 0.20)',
        panelBackground: 'rgba(11, 15, 25, 0.6)',
        inputBackground: 'rgba(226, 232, 240, 0.04)',
        inputFocusBackground: 'rgba(99, 102, 241, 0.10)',
      },

      // Alert background tint for error containers (dark-mode red wash).
      alertBackground: 'rgba(248, 113, 113, 0.12)',

      // ── The categorical meter ramp ────────────────────────────────────
      // Six steps + a rim for consumers that DRAW quantities as
      // proportional meter segments (stacks, gauges, tallies). The rim
      // guarantees each step's edge on light grounds where the pale
      // steps fail raw 3:1. Values are the starter's family — consumers
      // retune freely; only the STRUCTURE syncs.
      meter: {
        step1: '#818CF8',
        step2: '#22D3EE',
        step3: '#FBBF24',
        step4: '#4ADE80',
        step5: '#F5F5F4',
        step6: '#9CA3AF',
        rim: '#0F172A',
      },

      // ── The focus register ─────────────────────────────────────────────
      // A mode-independent surface family for "doing" surfaces — live
      // capture, active sessions, focus modes: dark in BOTH palettes
      // (an instrument, not a document). Consumers override the values;
      // the structure ships so focus-reading primitives (the chit
      // toast, curtains, focus screens) have one place to read. Not a
      // third color scheme — useAppTheme() still resolves two.
      focus: {
        background: '#0F1218',
        surface: '#171B24',
        surfaceAlt: '#1D2230',
        border: '#272E3F',
        text: '#F1F5FA',
        muted: '#93A0B4',
        signal: '#818CF8',
        onSignal: '#0F1218',
        track: '#232A3A',
        signalSoft: 'rgba(129, 140, 248, 0.16)',
      },

      // ── Mobile premium primitive kit tokens (dark) ───────────────────
      // Mirrors the light `mobilePremium` block, retuned for dark surfaces:
      //   • Hairline border = light-on-dark at low opacity (inverse of
      //     the light kit's dark-on-light).
      //   • Surface gradient = top slightly lighter than bottom (suggests
      //     a soft overhead light catching a raised surface).
      //   • Stronger outer glow — dark surfaces need more shadow to read
      //     as elevated against a dark background.
      mobilePremium: {
        hairlineBorder: 'rgba(226, 232, 240, 0.08)',
        hairlineBorderStrong: 'rgba(226, 232, 240, 0.15)',

        surfaceGradientTop: 'rgba(226, 232, 240, 0.05)',
        surfaceGradientBottom: 'rgba(226, 232, 240, 0.01)',

        surfaceGlow: '0 8px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.30)',

        // The instrument lift (see light's comment) — the one docked
        // instrument's reserved shadow, heavier at night.
        instrumentShadow:
          '0 -2px 6px rgba(0, 0, 0, 0.4), 0 -12px 32px rgba(0, 0, 0, 0.55)',

        surfaceBackdropBlur: 'blur(24px) saturate(140%)',

        androidChromeSurfaceBackground: 'rgba(22, 30, 46, 0.88)',
        androidChromeSurfaceBlur: 'blur(12px)',

        // Nav drawer — same treatment as the light kit (blur strength and
        // shadow depth are mode-independent; the scrim alpha comes from
        // backgroundDeep at the call site).
        navScrimBackdropBlur: 'blur(8px)',
        navScrimAlpha: 'cc',
        navPanelShadow: '4px 0 32px rgba(0, 0, 0, 0.36), 0 2px 8px rgba(0, 0, 0, 0.2)',

        atmosphereVignette: 'inset 0 0 160px 60px rgba(0, 0, 0, 0.30)',

        railTrack: 'rgba(226, 232, 240, 0.10)',
        railFillShadow: '0 0 8px currentColor',
      },
    },
  },

  // Spacing system
  spacing: {
    xxs: 2,
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
  },

  // Font sizes
  fontSize: {
    xs: 12,
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
  },

  // Border radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    pill: 9999,
  },

  // ── Shape tokens ────────────────────────────────────────────────────
  // Semantic corner radii for the MobilePremium kit. This family is the
  // single re-skin point for the kit's shape language: a consumer going
  // sleek/monotone sets surface/control to 8 and tag to 4 here, and every
  // kit primitive follows — no component edits. `borderRadius` above is
  // the raw size scale for ad-hoc shapes; primitives use these semantics.
  shapes: {
    /** Cards + section surfaces (MobileSurface, StatCard, alerts). */
    surface: 16,
    /** Portal panels — bottom sheets, calendar/dialog bodies. */
    sheet: 20,
    /** Inputs, buttons, selects — interactive controls. */
    control: 14,
    /** Small tiles — selection rows, option containers, thumbnails. */
    tile: 12,
    /** Chips, tags, badges. 999 renders full round. */
    tag: 999,
  },

  // ── Atmosphere tokens ────────────────────────────────────────────────
  // The atmosphere-language override point — the same discipline as
  // `shapes`: the consumer declares the background style ONCE here and
  // every MobileAtmosphere (scaffolds, drawers, auth screens) follows,
  // with no per-callsite prop threading. `MobileAtmosphere`'s
  // `showOrbs` prop remains as the explicit per-callsite override
  // (the dev showcase uses it to demo both styles under one theme).
  atmosphere: {
    /**
     * The background style the atmosphere renders.
     * - 'aurora': drifting color-field orbs over the base tint — the
     *   starter's premium read, the glass dialect's preset.
     * - 'flat': base tint + vignette only, no orbs — the editorial or
     *   retail read for consumers whose design language wants calm
     *   paper. Orb drift stops too (nothing left to animate).
     *
     * Defaults to the dialect preset; write a literal to override.
     */
    style: DIALECT_PRESETS[DIALECT].atmosphere,
  },

  // ── Drawer tokens ────────────────────────────────────────────────────
  // The nav-drawer surface language override point — the same
  // discipline as `shapes`/`atmosphere`: declare it once here and the
  // drawer follows, no per-callsite props.
  //   • 'sheet': the glass-scrim iOS sheet this component shipped as —
  //     blur scrim, atmosphere body, hairline edge (the glass dialect's
  //     preset).
  //   • 'ink': the inverted plate (InkPanel) — the consumer whose boot
  //     moment, route transitions, and toasts already speak the ink
  //     language joins the drawer to that family: text-color plate +
  //     print grain + brand edge rule, flat dim scrim (no blur), the
  //     masthead riding ON the plate (MobileHomeHeader onPlate).
  //     Defaults to the dialect preset; write a literal to override.
  drawer: {
    style: DIALECT_PRESETS[DIALECT].drawer,
  },

  // ── Toast tokens ────────────────────────────────────────────────────
  // The transient-message surface language, same discipline as the
  // family above. 'card' is the bordered card with colored icons — the
  // glass dialect's default. 'chit' is the ink treatment — the
  // announcement strip's strong tone, floating: ink plate
  // (`colors.text`, bone in dark), paper type, one 7px status dot,
  // receipt-mono message when `fonts.mono` is declared, flat air (no
  // shadow, no stripe, no icon triad). Defaults to the dialect preset;
  // write a literal to override.
  toast: {
    style: DIALECT_PRESETS[DIALECT].toast,
  },

  // ── Transition tokens ────────────────────────────────────────────────
  // The route-transition axis — the one motion declaration. 'none' (the
  // glass dialect's preset): the curtain machinery stays retired —
  // withRouteCurtain passes straight through and the overlay never
  // mounts. 'curtain' (the ink preset): the shell's RouteCurtain plays
  // — the full-bleed ink plate sweeping navigation (cover, stamp,
  // paper-chaser lift), wired through NavigationHelper. Write a
  // literal to override the preset.
  transition: {
    style: DIALECT_PRESETS[DIALECT].transition,
  },

  // ── Type families ───────────────────────────────────────────────────
  // The same discipline as shapes/atmosphere/drawer: declare the pair
  // ONCE here and every face-aware read (typography tokens, eyebrows,
  // figure styles) follows — no per-callsite fontFamily threading. See
  // the TypeFaces block above for the self-hosting recipe.
  fonts: FONTS,

  // ── Named type styles ─────────────────────────────────────────────────
  // Premium reads through type. Consumers import the named style and spread
  // it; they do NOT pick ad-hoc fontSize/fontWeight values for titles and
  // subtitles. Consumers pick from named styles, not ad-hoc values —
  // retune the values here, but keep the named-style discipline.
  typography: {
    mobileTitle: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: -0.2,
      fontFamily: FONTS.display,
    } satisfies TypographyToken,
    mobileSubtitle: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
    } satisfies TypographyToken,
    mobileBody: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 22,
      letterSpacing: 0,
    } satisfies TypographyToken,
    mobileAction: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0.4,
    } satisfies TypographyToken,
    mobileEyebrow: {
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 14,
      letterSpacing: 1.4,
      fontFamily: FONTS.mono,
    } satisfies TypographyToken,
    mobileFieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 16,
      letterSpacing: 0.1,
    } satisfies TypographyToken,
    // ── Figure language ────────────────────────────────────────────────
    // Numbers are content too, so the scale names their slots. Every
    // figure token carries tabular figures by construction — a call
    // site cannot forget them — and picks a declared face up the same
    // way mobileTitle/mobileEyebrow do (display for hero/stat figures,
    // mono for in-row ledger facts).
    mobileHero: {
      fontSize: 56,
      fontWeight: '800',
      lineHeight: 60,
      letterSpacing: -2,
      fontVariant: ['tabular-nums'],
      fontFamily: FONTS.display,
    } satisfies TypographyToken,
    mobileDisplay: {
      fontSize: 56,
      fontWeight: '800',
      lineHeight: 56,
      letterSpacing: -2,
      fontVariant: ['tabular-nums'],
      fontFamily: FONTS.display,
    } satisfies TypographyToken,
    mobileFigure: {
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 26,
      letterSpacing: -0.3,
      fontVariant: ['tabular-nums'],
      fontFamily: FONTS.display,
    } satisfies TypographyToken,
    mobileItemTitle: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0,
    } satisfies TypographyToken,
    // Condensed title — mobileTitle's job in the condensed display
    // position: focus-register screens whose headline is a NAME read
    // at arm's length (a live-capture label, an active-session title).
    mobileTitleCondensed: {
      fontSize: 34,
      fontWeight: '800',
      lineHeight: 38,
      letterSpacing: -0.5,
      fontFamily: FONTS.displayCondensed,
    } satisfies TypographyToken,
    mobileLedger: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
      letterSpacing: 0,
      fontVariant: ['tabular-nums'],
      fontFamily: FONTS.mono,
    } satisfies TypographyToken,
    // Counter — THE working figure at display size: live values a user
    // changes mid-task (a timer, a quantity stepper, a live total).
    // Rides the MONO face (tabular by construction — changing digits
    // hold their columns and cannot jitter) and is the one place the
    // mono face is allowed above 30px. No-op until `fonts.mono` is
    // declared.
    mobileCounter: {
      fontSize: 56,
      fontWeight: '700',
      lineHeight: 60,
      letterSpacing: -1,
      fontVariant: ['tabular-nums'],
      fontFamily: FONTS.mono,
    } satisfies TypographyToken,
    mobileMeta: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0,
      fontVariant: ['tabular-nums'],
    } satisfies TypographyToken,
    mobileTag: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 16,
      letterSpacing: 0.1,
    } satisfies TypographyToken,
  },
};

// The two color schemes arqavellum supports. `light` is the default. Type-wide
// so consumers can type their own APIs (`onChangeColorScheme(next: ColorScheme)`).
export type ColorScheme = 'light' | 'dark';

// The atmosphere background styles (`theme.atmosphere.style`). 'aurora' is
// the starter default; a consumer declares 'flat' to turn the orbs off
// app-wide in one place.
export type AtmosphereStyle = 'aurora' | 'flat';

// The toast surface styles (`theme.toast.style`) — the bordered card the
// glass dialect presets vs the floating ink chit the ink dialect presets.
export type ToastStyle = 'card' | 'chit';

// Convenience aliases — the resolved palette shape for either mode. Both
// `light` and `dark` are structurally identical, so the union collapses to
// a single shape.
export type ColorPalette = typeof theme.colors.light;
