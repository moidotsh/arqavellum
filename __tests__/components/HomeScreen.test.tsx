// __tests__/components/HomeScreen.test.tsx
// The launchpad renders for every visitor — the guard ships open.

import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '../../stores';
import { ThemeProvider, AuthProvider } from '../../context';
import HomeScreen from '../../app/index';

describe('HomeScreen (the launchpad)', () => {
  beforeEach(() => {
    useAuthStore.getState().reset?.();
    useAuthStore.setState({ status: 'unauthenticated', userId: null, email: null });
  });

  it('renders for an anonymous visitor — no wall, and the open-guard note says where the switch lives', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <HomeScreen />
        </AuthProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText(/launchpad/i)).toBeTruthy();
    expect(screen.getByText(/open by default/i)).toBeTruthy();
    expect(screen.getByText(/APP_LAYOUT\.authGuard/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('renders the signed-in read when a session exists', async () => {
    // The dev auth bypass mounts the provider with a mock session — the
    // session lives in provider state, so this is the honest path to a
    // signed-in render without faking the supabase restore.
    process.env.EXPO_PUBLIC_DISABLE_AUTH = '1';
    try {
      render(
        <ThemeProvider>
          <AuthProvider>
            <HomeScreen />
          </AuthProvider>
        </ThemeProvider>,
      );
      await waitFor(() => expect(screen.getByText(/welcome back/i)).toBeTruthy());
      // Matches twice: the account row's description and the footer button.
      expect(screen.getAllByText(/sign out/i).length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/account settings/i)).toBeTruthy();
    } finally {
      delete process.env.EXPO_PUBLIC_DISABLE_AUTH;
    }
  });
});
