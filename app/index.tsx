// app/index.tsx
// Home. Arqavellum ships a launchpad, not a wall: a fresh clone opens
// here for EVERY visitor (the guard ships open — APP_LAYOUT.authGuard
// in constants/layout.ts), signed in or not. The launchpad points at
// the design-system showcase (dev surfaces) and the auth scaffolding
// (for consumers who keep login), and states what the shell ships.
// Consumers replace this with their actual home/dashboard route (and
// re-evaluate gating per the §9 decision framework in
// docs/architecture/mobile-premium-design-system.md).

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MobileAtmosphere,
  MobileSurface,
  MobileHeader,
  MobilePrimaryButton,
  MobileActionFooter,
  MobileSectionEyebrow,
  MobileSettingsRow,
} from '../components/MobilePremium';
import { LogIn, LogOut, Palette } from '@tamagui/lucide-icons-2';
import { useAuth, useAppTheme } from '../context';
import {
  navigateToSettings,
  navigateToPremiumShowcase,
  navigateToLogin,
} from '../navigation';
import { SCREEN_BODY_STYLE, APP_DISPLAY_NAME } from '../constants';

// Dev surfaces gate — the same env the metro stub reads. In production
// exports /dev/* resolves to an empty stub, so the launchpad hides the
// row there instead of pointing at a blank page.
const DEV_SURFACES = process.env.EXPO_PUBLIC_DEV_SURFACES === '1';

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const { colors } = useAppTheme();
  const signedIn = session != null;

  return (
    <SafeAreaView style={[styles.shell, { backgroundColor: colors.backgroundDeep }]} edges={['top', 'bottom']}>
      <MobileAtmosphere surface="analytics" />
      <MobileHeader
        title={APP_DISPLAY_NAME}
        eyebrow={signedIn ? 'Welcome back' : 'Welcome'}
      />
      <View style={styles.body}>
        <MobileSectionEyebrow>Getting Started</MobileSectionEyebrow>
        <MobileSurface padding={20}>
          <Text style={[styles.text, { color: colors.text }]}>
            This is {APP_DISPLAY_NAME}&rsquo;s launchpad — the shell is wired end-to-end:
            navigation, the MobilePremium design system, Zustand stores, React Query,
            the 13-audit pre-commit gate, and optional email/password auth.
          </Text>
          <View style={{ height: 12 }} />
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {signedIn ? (
              <>
                Signed in as{' '}
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {session?.email ?? 'unknown'}
                </Text>
                .
              </>
            ) : (
              <>
                Not signed in — and everything still opens: the auth guard ships{' '}
                <Text style={{ color: colors.text, fontWeight: '600' }}>open by default</Text>
                {' '}(<Text style={{ color: colors.textMuted }}>constants/layout.ts → APP_LAYOUT.authGuard</Text>),
                because a starter is a showcase until you build in it, and plenty of
                apps never use login at all.
              </>
            )}
          </Text>
        </MobileSurface>

        <View style={{ height: 16 }} />
        <MobileSectionEyebrow>Reference</MobileSectionEyebrow>
        <MobileSurface padding={0}>
          {DEV_SURFACES ? (
            <MobileSettingsRow
              icon={<Palette size={20} color={colors.brandText} />}
              label="Design system showcase"
              description="Every primitive, both dialect languages — dev only"
              onPress={navigateToPremiumShowcase}
            />
          ) : null}
          <MobileSettingsRow
            icon={<LogIn size={20} color={colors.brandText} />}
            label={signedIn ? 'Account settings' : 'Sign in'}
            description={
              signedIn
                ? 'Email, password, sign out'
                : 'The auth scaffolding — optional in every consumer'
            }
            onPress={signedIn ? navigateToSettings : navigateToLogin}
          />
        </MobileSurface>

        <View style={{ height: 16 }} />
        <MobileSurface padding={20}>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Replace this screen with your home route (consumer guide, step 7) —
            the shell beneath it is yours to keep.
          </Text>
        </MobileSurface>
      </View>
      {signedIn ? (
        <MobileActionFooter>
          <MobilePrimaryButton variant="ghost" onPress={() => void signOut()}>
            <View style={styles.signOutRow}>
              <LogOut size={16} color={colors.brand} />
              <Text style={{ color: colors.brand, fontWeight: '600', marginLeft: 6 }}>Sign Out</Text>
            </View>
          </MobilePrimaryButton>
        </MobileActionFooter>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  body: {
    ...SCREEN_BODY_STYLE,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
