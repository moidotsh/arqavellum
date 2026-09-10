// components/MobilePremium/MobileAnnouncementBar.tsx
//
// Owner-authored announcement strip — the one-line broadcast surface a
// shop or tool needs above its content: "Pickup Friday 17–19h", "Drop
// 004 opens Friday". Purely presentational, like OfflineBanner: the
// consumer owns the message, the decision to mount, and any
// dismissed-once persistence — the primitive renders the strip, an
// optional action, and an optional dismiss control.

import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { X } from '@tamagui/lucide-icons-2';
import { theme } from '../../constants';
import { useAppTheme } from '../../context';

export interface MobileAnnouncementBarProps {
  /** The announcement — one line of owner copy. */
  message: string;
  /** Optional inline action label (e.g. "Details"). Requires `onAction`. */
  actionLabel?: string;
  /** Action press handler. Required when `actionLabel` is set. */
  onAction?: () => void;
  /** When set, renders the dismiss (X) control and forwards the press. */
  onDismiss?: () => void;
  /** Test ID. */
  testID?: string;
  /** Outer style pass-through. */
  style?: StyleProp<ViewStyle>;
}

export function MobileAnnouncementBar({
  message,
  actionLabel,
  onAction,
  onDismiss,
  testID,
  style,
}: MobileAnnouncementBarProps) {
  const { colors } = useAppTheme();
  const hasAction = actionLabel != null && onAction != null;

  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      style={[styles.shell, { backgroundColor: colors.brandMuted, borderColor: colors.cardBorder }, style]}
    >
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
      {hasAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.actionText, { color: colors.brand }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {onDismiss != null ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss announcement"
          style={({ pressed }) => [styles.dismiss, { opacity: pressed ? 0.6 : 1 }]}
        >
          <X size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.shapes.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  message: {
    flexShrink: 1,
    flexGrow: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 17,
  },
  action: {
    flexShrink: 0,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dismiss: {
    flexShrink: 0,
    padding: 2,
  },
});

export default MobileAnnouncementBar;
