// components/composed/ScreenScaffold.tsx
// The one screen skeleton: atmosphere + a header slot + the policy-
// compliant scrolling body + a centered content column. Screens compose
// this instead of re-stating the same wrappers — the column width,
// paddings, and the SB1 screen-body policy live here only.
//
// Header conventions:
//   • The app's home screen passes its own brand header (`header`).
//   • Every child screen passes `navTitle` (+ `onBack`) — renders a
//     nav-mode MobileHeader (back chevron + accent dot + inline title),
//     the standard child-screen chrome across consumers. The hamburger
//     / drawer lives on the home header only; child screens go back
//     with the chevron.

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../context';
import { SCREEN_BODY_STYLE } from '../../constants';
import { MobileAtmosphere, MobileHeader, type MobileAtmosphereSurface } from '../MobilePremium';

interface ScreenScaffoldProps {
  /** Header chrome (the consumer's home header, a detail back row, or nothing). */
  header?: React.ReactNode;
  /** Child-screen title — renders a nav-mode MobileHeader when `header` is absent. */
  navTitle?: string;
  /** Back handler for the nav header's chevron. */
  onBack?: () => void;
  /** Small action slot in the nav header (before the dismiss X, when used). */
  navRightAction?: React.ReactNode;
  /** Atmosphere palette. Default 'analytics'. */
  surface?: MobileAtmosphereSurface;
  /** Content column max width. Default 640. */
  maxWidth?: number;
  /**
   * Extra bottom scroll padding. Default 24; raised to FOOTER_INSET when a
   * `footer` mounts (fixed overlay chrome needs clearance) unless already
   * larger.
   */
  paddingBottom?: number;
  /** Fixed overlay chrome rendered after the body (action footers, trays). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Clearance for a fixed footer's height so the body's tail stays reachable. */
const FOOTER_INSET = 96;

export function ScreenScaffold({
  header,
  navTitle,
  onBack,
  navRightAction,
  surface = 'analytics',
  maxWidth = 640,
  paddingBottom = 24,
  footer,
  children,
}: ScreenScaffoldProps) {
  const { colors } = useAppTheme();
  const resolvedHeader =
    header ??
    (navTitle != null ? (
      <MobileHeader title={navTitle} onBack={onBack} navRightAction={navRightAction} />
    ) : undefined);

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <MobileAtmosphere surface={surface} />
      {resolvedHeader}
      <ScrollView
        style={SCREEN_BODY_STYLE}
        contentContainerStyle={{
          paddingBottom: footer ? Math.max(paddingBottom, FOOTER_INSET) : paddingBottom,
        }}
      >
        <View style={[styles.column, { maxWidth }]}>{children}</View>
      </ScrollView>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
});

export default ScreenScaffold;
