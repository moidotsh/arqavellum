// __tests__/components/MobileTabBar.test.tsx
//
// Component-level render + interaction tests for MobileTabBar.
//   - Renders all four flanking tab labels + the center START label
//   - Active tab carries selected:true accessibility state (inactive false)
//   - Tab press fires the item's onPress
//   - Center action press fires its onPress
//   - centerAction.active swaps START → RESUME + expanded state
//   - testID passes through (the showcase declares "showcase-tab-bar")
//
// RN mock note: label colors and the notch fill live in ARRAY styles, which
// React DOM drops (only single-object styles reach the DOM) — so the
// active/inactive distinction is asserted via accessibilityState instead.

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import {
  MobileTabBar,
  type MobileTabBarItem,
} from '../../components/MobilePremium/MobileTabBar';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function makeItems(): [MobileTabBarItem, MobileTabBarItem, MobileTabBarItem, MobileTabBarItem] {
  return [
    { id: 'home', label: 'Home', icon: null, onPress: vi.fn() },
    { id: 'stats', label: 'Stats', icon: null, onPress: vi.fn() },
    { id: 'log', label: 'Log', icon: null, onPress: vi.fn() },
    { id: 'settings', label: 'Settings', icon: null, onPress: vi.fn() },
  ];
}

const CENTER = {
  label: 'Start run',
  icon: null,
  onPress: vi.fn(),
};

describe('MobileTabBar — render', () => {
  it('renders the four flanking tab labels + START center label', () => {
    const { getByText } = render(
      <Wrap>
        <MobileTabBar items={makeItems()} activeId="home" centerAction={CENTER} />
      </Wrap>,
    );
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Stats')).toBeTruthy();
    expect(getByText('Log')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('START')).toBeTruthy();
  });

  it('passes testID through and renders per-tab testIDs', () => {
    const { container } = render(
      <Wrap>
        <MobileTabBar
          items={makeItems()}
          activeId="home"
          centerAction={CENTER}
          testID="showcase-tab-bar"
        />
      </Wrap>,
    );
    // RN-web renders testID as the bare `testid` attribute.
    expect(container.querySelector('view[testid="showcase-tab-bar"]')).not.toBeNull();
    expect(container.querySelector('pressable[testid="tab-bar-home"]')).not.toBeNull();
    expect(container.querySelector('pressable[testid="tab-bar-center-action"]')).not.toBeNull();
  });

  it('renders as a tablist', () => {
    const { container } = render(
      <Wrap>
        <MobileTabBar items={makeItems()} activeId="home" centerAction={CENTER} />
      </Wrap>,
    );
    expect(container.querySelector('[accessibilityrole="tablist"]')).not.toBeNull();
  });
});

describe('MobileTabBar — active tab state', () => {
  it('marks exactly the active tab selected:true', () => {
    const { container } = render(
      <Wrap>
        <MobileTabBar items={makeItems()} activeId="stats" centerAction={CENTER} />
      </Wrap>,
    );
    const stats = container.querySelector('[accessibilitylabel="Stats tab"]') as Element;
    const home = container.querySelector('[accessibilitylabel="Home tab"]') as Element;
    expect(stats.getAttribute('accessibilitystate')).toContain('selected:true');
    expect(home.getAttribute('accessibilitystate')).toContain('selected:false');
  });
});

describe('MobileTabBar — presses', () => {
  it('tab press fires the item onPress', () => {
    const items = makeItems();
    const { getByText } = render(
      <Wrap>
        <MobileTabBar items={items} activeId="home" centerAction={CENTER} />
      </Wrap>,
    );
    fireEvent.click(getByText('Log'));
    expect(items[2].onPress).toHaveBeenCalledTimes(1);
  });

  it('center action press fires its onPress', () => {
    const center = { ...CENTER, onPress: vi.fn() };
    const { container } = render(
      <Wrap>
        <MobileTabBar items={makeItems()} activeId="home" centerAction={center} />
      </Wrap>,
    );
    const centerButton = container.querySelector(
      'pressable[testid="tab-bar-center-action"]',
    ) as Element;
    fireEvent.click(centerButton);
    expect(center.onPress).toHaveBeenCalledTimes(1);
  });
});

describe('MobileTabBar — active center action', () => {
  it('centerAction.active renders RESUME + expanded state', () => {
    const { getByText, container } = render(
      <Wrap>
        <MobileTabBar items={makeItems()} activeId="home" centerAction={{ ...CENTER, active: true }} />
      </Wrap>,
    );
    expect(getByText('RESUME')).toBeTruthy();
    const centerButton = container.querySelector(
      'pressable[testid="tab-bar-center-action"]',
    ) as Element;
    expect(centerButton.getAttribute('accessibilitystate')).toContain('expanded:true');
  });
});
