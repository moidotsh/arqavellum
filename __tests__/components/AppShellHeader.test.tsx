// __tests__/components/AppShellHeader.test.tsx
//
// Render + interaction smoke for the composed home header:
//   - the brand reads the shell's display-name slot
//   - the hamburger opens the drawer (destinations render)
//   - tapping a destination fires its onPress and closes the drawer

import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import { AppShellHeader } from '../../components/composed/AppShellHeader';
import { theme } from '../../constants';
import type { MobileNavDrawerItem } from '../../components/MobilePremium';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function makeItems(): MobileNavDrawerItem[] {
  return [
    { id: '/', label: 'Home', onPress: vi.fn() },
    { id: '/items', label: 'Items', onPress: vi.fn() },
    { id: '/settings', label: 'Settings', onPress: vi.fn() },
  ];
}

function findButton(container: HTMLElement, label: string): Element {
  const el = container.querySelector(`[accessibilitylabel="${label}"]`);
  expect(el).not.toBeNull();
  return el as Element;
}

describe('AppShellHeader', () => {
  afterEach(() => {
    // The dialect tests below flip the live token — restore the
    // starter default so no other test inherits an ink drawer.
    (theme.drawer as { style: 'glass' | 'ink' }).style = 'glass';
  });

  it('renders the brand from the display-name slot', () => {
    const { container } = render(
      <Wrap>
        <AppShellHeader items={makeItems()} />
      </Wrap>,
    );
    expect(container.textContent).toContain('Arqavellum');
  });

  it('opens the drawer on hamburger press and reveals destinations', () => {
    const items = makeItems();
    const { container } = render(
      <Wrap>
        <AppShellHeader items={items} />
      </Wrap>,
    );

    // Closed: no destinations visible.
    expect(container.textContent).not.toContain('Items');

    fireEvent.click(findButton(container, 'Open menu'));

    expect(container.textContent).toContain('Home');
    expect(container.textContent).toContain('Items');
    expect(container.textContent).toContain('Settings');
  });

  it('under glass, the glass cap layers under the masthead', () => {
    const { container } = render(
      <Wrap>
        <AppShellHeader items={makeItems()} />
      </Wrap>,
    );
    expect(container.querySelector('[testid="app-shell-glass-cap"]')).not.toBeNull();
  });

  it('under ink, the cap retires and the masthead rides the plate', () => {
    (theme.drawer as { style: 'glass' | 'ink' }).style = 'ink';
    const { container } = render(
      <Wrap>
        <AppShellHeader items={makeItems()} />
      </Wrap>,
    );
    expect(container.querySelector('[testid="app-shell-glass-cap"]')).toBeNull();

    // Destinations still open + render (ledger styling is style-level —
    // textContent keeps the source case).
    fireEvent.click(findButton(container, 'Open menu'));
    expect(container.textContent).toContain('Items');
    expect(container.textContent).toContain('Settings');
  });

  it('fires a destination onPress and closes the drawer on tap', async () => {
    const items = makeItems();
    const { container, getByText } = render(
      <Wrap>
        <AppShellHeader items={items} />
      </Wrap>,
    );

    fireEvent.click(findButton(container, 'Open menu'));
    fireEvent.click(getByText('Items'));

    expect(items[1].onPress).toHaveBeenCalledTimes(1);
    // The drawer unmounts after its exit animation — wait out the slide.
    await vi.waitFor(() => {
      expect(container.textContent).not.toContain('Settings');
    });
  });
});
