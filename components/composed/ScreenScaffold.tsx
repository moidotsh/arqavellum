// components/composed/ScreenScaffold.tsx
// The one screen skeleton: atmosphere + a header slot + the policy-
// compliant scrolling body + a centered content column. Screens compose
// this instead of re-stating the same wrappers — the column width,
// paddings, and the SB1 screen-body policy live here only.

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../context';
import { SCREEN_BODY_STYLE } from '../../constants';
import { MobileAtmosphere, type MobileAtmosphereSurface } from '../MobilePremium';

interface ScreenScaffoldProps {
  /** Header chrome (the consumer's home header, a detail back row, or nothing). */
  header?: React.ReactNode;
  /** Atmosphere palette. Default 'analytics'. */
  surface?: MobileAtmosphereSurface;
  /** Content column max width. Default 640. */
  maxWidth?: number;
  /** Extra bottom scroll padding (sticky footers, trays). Default 24. */
  paddingBottom?: number;
  /** Fixed overlay chrome rendered after the body (action footers, trays). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function ScreenScaffold({
  header,
  surface = 'analytics',
  maxWidth = 640,
  paddingBottom = 24,
  footer,
  children,
}: ScreenScaffoldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <MobileAtmosphere surface={surface} />
      {header}
      <ScrollView
        style={SCREEN_BODY_STYLE}
        contentContainerStyle={{ paddingBottom }}
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
