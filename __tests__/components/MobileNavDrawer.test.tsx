// __tests__/components/MobileNavDrawer.test.tsx
//
// Component-level render + interaction tests for MobileNavDrawer.
//   - closed renders nothing
//   - open renders item labels (+ count badges)
//   - pressing an item fires its onPress and then onClose
//   - scrim tap fires onClose
//   - activePathname highlights the matching row (selected:true)
//   - brandPersistence: 'slideout' renders the header slot, 'cutout' ignores it
//
// Environment note: useSafeAreaInsets is mocked globally in setup.ts. The
// drawer slides via requestAnimationFrame + CSS transitions — the items
// mount synchronously on open (effects flush inside act), so no waiting is
// needed to see labels; only unmount waits out the exit animation.

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import {
  MobileNavDrawer,
  type MobileNavDrawerItem,
} from '../../components/MobilePremium/MobileNavDrawer';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function makeItems(): MobileNavDrawerItem[] {
  return [
    { id: '/', label: 'Home', onPress: vi.fn() },
    { id: '/items', label: 'Items', onPress: vi.fn(), badge: 3 },
    { id: '/settings', label: 'Settings', onPress: vi.fn() },
  ];
}

describe('MobileNavDrawer — open state', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <Wrap>
        <MobileNavDrawer open={false} onClose={() => {}} items={makeItems()} />
      </Wrap>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders item labels and count badges when open', () => {
    const { getByText, queryByText } = render(
      <Wrap>
        <MobileNavDrawer open onClose={() => {}} items={makeItems()} />
      </Wrap>,
    );
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Items')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    // badge=3 renders the count.
    expect(queryByText('3')).not.toBeNull();
  });
});

describe('MobileNavDrawer — interaction', () => {
  it('item press fires the item onPress and closes the drawer', () => {
    const items = makeItems();
    const onClose = vi.fn();
    const { getByText } = render(
      <Wrap>
        <MobileNavDrawer open onClose={onClose} items={items} />
      </Wrap>,
    );
    fireEvent.click(getByText('Items'));
    expect(items[1].onPress).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('scrim tap fires onClose', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileNavDrawer open onClose={onClose} items={makeItems()} testID="nav-drawer" />
      </Wrap>,
    );
    // The scrim is the overlay's first direct Pressable child (the panel
    // is an animated-view that comes after it).
    const scrim = container
      .querySelector('view[testid="nav-drawer"]')
      ?.querySelector('pressable') as Element;
    expect(scrim).not.toBeNull();
    fireEvent.click(scrim);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('MobileNavDrawer — active highlight', () => {
  it('marks the item matching activePathname selected:true', () => {
    const { container } = render(
      <Wrap>
        <MobileNavDrawer
          open
          onClose={() => {}}
          items={makeItems()}
          activePathname="/items/42"
        />
      </Wrap>,
    );
    // startsWith match: nested route highlights its parent item.
    const itemsRow = container.querySelector('[accessibilitylabel="Items"]') as Element;
    const homeRow = container.querySelector('[accessibilitylabel="Home"]') as Element;
    expect(itemsRow.getAttribute('accessibilitystate')).toContain('selected:true');
    expect(homeRow.getAttribute('accessibilitystate')).toContain('selected:false');
  });
});

describe('MobileNavDrawer — brand persistence modes', () => {
  it('slideout (default) renders the header slot', () => {
    const { getByText } = render(
      <Wrap>
        <MobileNavDrawer
          open
          onClose={() => {}}
          items={makeItems()}
          header={<span>Brand Slot</span>}
        />
      </Wrap>,
    );
    expect(getByText('Brand Slot')).toBeTruthy();
  });

  it('cutout ignores the header slot (the home header shows through)', () => {
    const { queryByText, getByText } = render(
      <Wrap>
        <MobileNavDrawer
          open
          onClose={() => {}}
          items={makeItems()}
          header={<span>Brand Slot</span>}
          brandPersistence="cutout"
        />
      </Wrap>,
    );
    expect(queryByText('Brand Slot')).toBeNull();
    // The items still render under the cutout.
    expect(getByText('Items')).toBeTruthy();
  });
});
