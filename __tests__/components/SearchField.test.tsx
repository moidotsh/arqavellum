// __tests__/components/SearchField.test.tsx
//
// Component-level render + interaction tests for SearchField.
//   - value + placeholder pass through to the textinput host element
//   - placeholder defaults to "Search"
//   - the input carries its accessibility label (default "Search")
//   - the clear button ("Clear search") appears only when there is text
//   - pressing the clear button fires onChangeText('')
//
// Mock-quirk note (why typing itself is not asserted): `onChangeText` is a
// function prop the RN host mock does not translate into a DOM event
// handler, so keystroke events can't reach it under jsdom. The clear-button
// path — a real Pressable → onPress → onChangeText('') — is the observable
// wiring test.

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import { SearchField } from '../../components/MobilePremium/SearchField';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('SearchField — value + placeholder', () => {
  it('passes value and a custom placeholder through to the input', () => {
    const { container } = render(
      <Wrap>
        <SearchField value=" whey " onChangeText={() => {}} placeholder="Find a product" />
      </Wrap>,
    );
    const input = container.querySelector('textinput') as Element;
    expect(input).not.toBeNull();
    expect(input.getAttribute('value')).toBe(' whey ');
    expect(input.getAttribute('placeholder')).toBe('Find a product');
  });

  it('defaults the placeholder to "Search"', () => {
    const { container } = render(
      <Wrap>
        <SearchField value="" onChangeText={() => {}} />
      </Wrap>,
    );
    expect((container.querySelector('textinput') as Element).getAttribute('placeholder')).toBe(
      'Search',
    );
  });

  it('carries the default accessibility label on the input (overridable)', () => {
    const { container } = render(
      <Wrap>
        <SearchField value="" onChangeText={() => {}} />
      </Wrap>,
    );
    const input = container.querySelector('textinput') as Element;
    expect(input.getAttribute('accessibilitylabel')).toBe('Search');

    const { container: custom } = render(
      <Wrap>
        <SearchField value="" onChangeText={() => {}} accessibilityLabel="Find exercises" />
      </Wrap>,
    );
    expect(
      (custom.querySelector('textinput') as Element).getAttribute('accessibilitylabel'),
    ).toBe('Find exercises');
  });
});

describe('SearchField — clear button', () => {
  it('shows the clear button only when the field has text', () => {
    const { container, rerender } = render(
      <Wrap>
        <SearchField value="" onChangeText={() => {}} />
      </Wrap>,
    );
    const queryClear = () => container.querySelector('[accessibilitylabel="Clear search"]');
    expect(queryClear()).toBeNull();

    rerender(
      <Wrap>
        <SearchField value="iso" onChangeText={() => {}} />
      </Wrap>,
    );
    expect(queryClear()).not.toBeNull();
  });

  it('pressing clear fires onChangeText with an empty string', () => {
    const onChangeText = vi.fn();
    const { container } = render(
      <Wrap>
        <SearchField value="iso" onChangeText={onChangeText} />
      </Wrap>,
    );
    fireEvent.click(container.querySelector('[accessibilitylabel="Clear search"]') as Element);
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});

describe('SearchField — chrome', () => {
  it('renders the leading search icon host element', () => {
    const { container } = render(
      <Wrap>
        <SearchField value="" onChangeText={() => {}} />
      </Wrap>,
    );
    expect(container.querySelector('search')).not.toBeNull();
  });

  it('passes testID through', () => {
    const { container } = render(
      <Wrap>
        <SearchField value="" onChangeText={() => {}} testID="catalog-search" />
      </Wrap>,
    );
    expect(container.querySelector('view[testid="catalog-search"]')).not.toBeNull();
  });
});
