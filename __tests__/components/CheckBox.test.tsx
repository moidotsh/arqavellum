// __tests__/components/CheckBox.test.tsx
//
// Component-level render tests for CheckBox (the bare indicator glyph).
//   - Renders the box + the mocked lucide Check host element
//   - Glyph size defaults to size - 8; size / checkSize props are honored
//   - Glyph color reads the textOnBrand token
//   - testID passes through to the box
//   - duration=0 (snap mode) renders with the glyph mounted
//
// Mock-quirk note (why the checked fill is not asserted): the box's
// backgroundColor/borderColor resolve into an ARRAY style, which React DOM
// drops (only single-object styles reach the DOM), and the check's
// opacity/scale ride an Animated.Value that never becomes a DOM style — so
// the checked vs unchecked visual difference is invisible to jsdom under the
// current RN mock. The glyph element intentionally mounts in both states;
// only its animated opacity distinguishes them. Left to the visual showcase.

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import { theme } from '../../constants';
import { CheckBox } from '../../components/MobilePremium/CheckBox';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function getCheck(container: HTMLElement): Element {
  const check = container.querySelector('check');
  expect(check).not.toBeNull();
  return check as Element;
}

describe('CheckBox — glyph', () => {
  it('renders the check glyph host element inside the box', () => {
    const { container } = render(
      <Wrap>
        <CheckBox checked />
      </Wrap>,
    );
    // Box view wraps an animated-view wrapping the glyph.
    expect(container.querySelector('view animated-view check')).not.toBeNull();
  });

  it('defaults the glyph size to size - 8', () => {
    const { container } = render(
      <Wrap>
        <CheckBox checked />
      </Wrap>,
    );
    expect(getCheck(container).getAttribute('size')).toBe('14'); // 22 - 8
  });

  it('scales the glyph with size and honors an explicit checkSize', () => {
    const { container: small } = render(
      <Wrap>
        <CheckBox checked size={30} />
      </Wrap>,
    );
    expect(getCheck(small).getAttribute('size')).toBe('22'); // 30 - 8

    const { container: explicit } = render(
      <Wrap>
        <CheckBox checked size={30} checkSize={18} />
      </Wrap>,
    );
    expect(getCheck(explicit).getAttribute('size')).toBe('18');
  });

  it('glyph color reads the textOnBrand token', () => {
    const { container } = render(
      <Wrap>
        <CheckBox checked accentColor="#123456" />
      </Wrap>,
    );
    expect(getCheck(container).getAttribute('color')).toBe(theme.colors.light.textOnBrand);
  });
});

describe('CheckBox — mounting states', () => {
  it('unchecked renders the same glyph structure (opacity animates off)', () => {
    const { container } = render(
      <Wrap>
        <CheckBox checked={false} />
      </Wrap>,
    );
    expect(container.querySelector('view animated-view check')).not.toBeNull();
  });

  it('duration=0 (snap) still renders and mounts the glyph', () => {
    const { container } = render(
      <Wrap>
        <CheckBox checked duration={0} />
      </Wrap>,
    );
    expect(container.querySelector('view animated-view check')).not.toBeNull();
  });

  it('passes testID through to the box', () => {
    const { container } = render(
      <Wrap>
        <CheckBox checked testID="tos-checkbox" />
      </Wrap>,
    );
    expect(container.querySelector('view[testid="tos-checkbox"]')).not.toBeNull();
  });
});
