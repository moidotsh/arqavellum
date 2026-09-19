// __tests__/components/MobileSelect.test.tsx
//
// Component-level render + interaction tests for MobileSelect. The select
// composes MobileSheet (open state is internal — the trigger opens it).
//   - Trigger shows the selected option's label
//   - Trigger shows the placeholder when nothing is selected
//   - Pressing the trigger opens the sheet (Modal host + sheet title)
//   - Pressing an option fires onValueChange AND closes the sheet
//   - Option descriptions render inside the sheet
//   - The selected option row carries selected:true + a check glyph
//
// RN mock note: Modal renders as a host <modal> element inside the
// container (no real portal) — same handling as MobileSheet.test.tsx.

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import { MobileSelect } from '../../components/MobilePremium/MobileSelect';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

const OPTIONS = [
  { value: 'alpha', label: 'Alpha', description: 'First and default' },
  { value: 'beta', label: 'Beta', description: 'Second choice' },
  { value: 'gamma', label: 'Gamma' },
];

describe('MobileSelect — trigger', () => {
  it('renders the selected option label in the trigger', () => {
    const { getByText } = render(
      <Wrap>
        <MobileSelect value="beta" options={OPTIONS} onValueChange={() => {}} />
      </Wrap>,
    );
    expect(getByText('Beta')).toBeTruthy();
  });

  it('renders the placeholder when no value is selected', () => {
    const { getByText } = render(
      <Wrap>
        <MobileSelect
          value=""
          options={OPTIONS}
          onValueChange={() => {}}
          placeholder="Pick a plan"
        />
      </Wrap>,
    );
    expect(getByText('Pick a plan')).toBeTruthy();
  });
});

describe('MobileSelect — sheet open/close', () => {
  it('pressing the trigger opens the sheet with its title', () => {
    const { container, getByText } = render(
      <Wrap>
        <MobileSelect
          value=""
          options={OPTIONS}
          onValueChange={() => {}}
          label="Plan"
          sheetTitle="Choose a plan"
        />
      </Wrap>,
    );
    expect(container.querySelector('modal')).toBeNull();

    // The trigger shows the default placeholder; tapping it opens the sheet.
    fireEvent.click(getByText('Select an option'));

    expect(container.querySelector('modal')).not.toBeNull();
    expect(getByText('Choose a plan')).toBeTruthy();
  });

  it('pressing an option fires onValueChange and closes the sheet', () => {
    const onValueChange = vi.fn();
    const { container, getByText } = render(
      <Wrap>
        <MobileSelect
          value=""
          options={OPTIONS}
          onValueChange={onValueChange}
          placeholder="Pick a plan"
          sheetTitle="Choose"
        />
      </Wrap>,
    );
    // Open via the trigger (placeholder text lives inside the Pressable).
    fireEvent.click(getByText('Pick a plan'));
    expect(container.querySelector('modal')).not.toBeNull();

    fireEvent.click(getByText('Beta'));

    expect(onValueChange).toHaveBeenCalledWith('beta');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    // Closed → MobileSheet returns null → the Modal host unmounts.
    expect(container.querySelector('modal')).toBeNull();
  });
});

describe('MobileSelect — option rows', () => {
  it('renders option descriptions inside the sheet', () => {
    const { getByText } = render(
      <Wrap>
        <MobileSelect value="" options={OPTIONS} onValueChange={() => {}} />
      </Wrap>,
    );
    // Closed: descriptions hidden with the sheet.
    // (Default placeholder text also says "Select an option" — open first.)
    fireEvent.click(getByText('Select an option'));
    expect(getByText('First and default')).toBeTruthy();
    expect(getByText('Second choice')).toBeTruthy();
  });

  it('marks the selected option row selected:true with a check glyph', () => {
    const { container, getByText } = render(
      <Wrap>
        <MobileSelect
          value="beta"
          options={OPTIONS}
          onValueChange={() => {}}
          placeholder="Pick a plan"
        />
      </Wrap>,
    );
    fireEvent.click(getByText('Beta'));

    const rows = container.querySelectorAll('modal pressable[accessibilityrole="button"]');
    const states = Array.from(rows).map((r) => r.getAttribute('accessibilitystate'));
    expect(states).toContain('selected:true');
    expect(states).toContain('selected:false');
    // Exactly one row is selected.
    expect(states.filter((s) => s === 'selected:true').length).toBe(1);
    // The selected row renders the lucide Check host element.
    expect(container.querySelectorAll('modal check').length).toBe(1);
  });
});
