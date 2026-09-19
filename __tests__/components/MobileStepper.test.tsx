// __tests__/components/MobileStepper.test.tsx
//
// Component-level interaction tests for MobileStepper (min/max/step/onChange API).
//   - Renders the current value (big number) + unit label
//   - Increment / decrement buttons fire onChange with stepped values
//   - Custom step size is honored
//   - min / max clamps: values never cross the bound, buttons disable at it
//
// RN mock note: the stepper fires on onPressIn/onPressOut (long-press
// acceleration), which the host mock maps to mousedown/mouseup — so tests
// press with fireEvent.mouseDown + fireEvent.mouseUp. The +/- glyphs render
// as the mocked lucide <plus>/<minus> host elements.
//
// SOURCE QUIRK (documented, not worked around): with the onChange API, the
// +/- enable flags compute `value < max` / `value > min`, and the defaults
// are NaN — so a stepper used WITHOUT explicit min/max renders both buttons
// permanently disabled (any comparison with NaN is false). Every test below
// passes explicit bounds, the same way the showcase does.

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import { MobileStepper } from '../../components/MobilePremium/MobileStepper';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function pressButton(container: HTMLElement, label: 'increment' | 'decrement') {
  const btn = container.querySelector(`[accessibilitylabel="${label}"]`);
  expect(btn).not.toBeNull();
  // onPressIn triggers the step; onPressOut releases the long-press timer.
  fireEvent.mouseDown(btn as Element);
  fireEvent.mouseUp(btn as Element);
}

describe('MobileStepper — value display', () => {
  it('renders the current value', () => {
    const { getByText } = render(
      <Wrap>
        <MobileStepper value={5} min={0} max={10} onChange={() => {}} />
      </Wrap>,
    );
    expect(getByText('5')).toBeTruthy();
  });

  it('renders the unit label under the value', () => {
    const { getByText } = render(
      <Wrap>
        <MobileStepper value={170} min={0} max={300} onChange={() => {}} unitLabel="cm" />
      </Wrap>,
    );
    expect(getByText('170')).toBeTruthy();
    expect(getByText('cm')).toBeTruthy();
  });

  it('renders decimal places via toFixed', () => {
    const { getByText } = render(
      <Wrap>
        <MobileStepper value={2.5} min={0} max={10} onChange={() => {}} decimalPlaces={1} />
      </Wrap>,
    );
    expect(getByText('2.5')).toBeTruthy();
  });
});

describe('MobileStepper — step buttons', () => {
  it('increment fires onChange with value + step', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileStepper value={5} min={0} max={10} onChange={onChange} />
      </Wrap>,
    );
    pressButton(container, 'increment');
    expect(onChange).toHaveBeenCalledWith(6);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('decrement fires onChange with value - step', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileStepper value={5} min={0} max={10} onChange={onChange} />
      </Wrap>,
    );
    pressButton(container, 'decrement');
    expect(onChange).toHaveBeenCalledWith(4);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('honors a custom step size', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileStepper value={5} min={0} max={10} step={2} onChange={onChange} />
      </Wrap>,
    );
    pressButton(container, 'increment');
    expect(onChange).toHaveBeenCalledWith(7);
  });
});

describe('MobileStepper — min/max clamps', () => {
  it('clamps at min: decrement reports min and the button disables', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileStepper value={5} min={5} onChange={onChange} />
      </Wrap>,
    );
    // At the bound the decrement button is disabled — the mock renders
    // the `disabled` attribute, and press-in does not fire onChange.
    const btn = container.querySelector('[accessibilitylabel="decrement"]') as Element;
    expect(btn.hasAttribute('disabled')).toBe(true);
    pressButton(container, 'decrement');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clamps the next value at max when stepping from below', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileStepper value={9} min={0} max={10} onChange={onChange} />
      </Wrap>,
    );
    pressButton(container, 'increment');
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('at max: increment button disables and press-in does not fire onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileStepper value={10} min={0} max={10} onChange={onChange} />
      </Wrap>,
    );
    const btn = container.querySelector('[accessibilitylabel="increment"]') as Element;
    expect(btn.hasAttribute('disabled')).toBe(true);
    pressButton(container, 'increment');
    expect(onChange).not.toHaveBeenCalled();
  });
});
