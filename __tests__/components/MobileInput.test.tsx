// __tests__/components/MobileInput.test.tsx
//
// Component-level render + interaction tests for MobileInput.
//   - Label renders above the input
//   - value / placeholder pass through to the textinput host element
//   - helperText renders in the slot below the input
//   - errorText renders and takes precedence over helperText
//   - the `error` prop is an alias of `errorText`
//   - right icon press fires onRightIconPress
//   - testID passes through
//
// Mock-quirk note (why no focus-border or onChangeText tests here):
// the __mocks__/react-native.ts host elements surface only single-object
// `style` props as DOM inline styles — MobileInput resolves its border /
// background / label colors into an ARRAY style on the TextInput, which
// React DOM drops, so the focus/error border color never reaches the DOM.
// Likewise `onChangeText`/`onFocus` are function props the host mock does
// not translate into DOM event handlers, so neither typing nor focusing is
// DOM-observable under the current mock. Both cases are left to the visual
// showcase, not asserted here.

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { ThemeProvider } from '../../context';
import { MobileInput } from '../../components/MobilePremium/MobileInput';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('MobileInput — label + value pass-through', () => {
  it('renders the label above the input', () => {
    const { getByText } = render(
      <Wrap>
        <MobileInput label="Email" value="" onChangeText={() => {}} />
      </Wrap>,
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('passes value and placeholder through to the textinput host element', () => {
    const { container } = render(
      <Wrap>
        <MobileInput
          label="Email"
          value="abc@example.com"
          onChangeText={() => {}}
          placeholder="you@example.com"
        />
      </Wrap>,
    );
    const input = container.querySelector('textinput') as Element;
    expect(input).not.toBeNull();
    expect(input.getAttribute('value')).toBe('abc@example.com');
    expect(input.getAttribute('placeholder')).toBe('you@example.com');
  });

  it('passes testID through to the field group', () => {
    const { container } = render(
      <Wrap>
        <MobileInput label="Email" value="" onChangeText={() => {}} testID="email-field" />
      </Wrap>,
    );
    expect(container.querySelector('view[testid="email-field"]')).not.toBeNull();
  });
});

describe('MobileInput — helper + error slots', () => {
  it('renders helperText below the input when there is no error', () => {
    const { getByText } = render(
      <Wrap>
        <MobileInput
          label="Email"
          value=""
          onChangeText={() => {}}
          helperText="We never share your email."
        />
      </Wrap>,
    );
    expect(getByText('We never share your email.')).toBeTruthy();
  });

  it('renders errorText in the dedicated error slot', () => {
    const { getByText } = render(
      <Wrap>
        <MobileInput
          label="Email"
          value=""
          onChangeText={() => {}}
          errorText="That email is taken."
        />
      </Wrap>,
    );
    expect(getByText('That email is taken.')).toBeTruthy();
  });

  it('error outranks helperText — helper is hidden when an error is present', () => {
    const { getByText, queryByText } = render(
      <Wrap>
        <MobileInput
          label="Email"
          value=""
          onChangeText={() => {}}
          helperText="Helper copy"
          errorText="Error copy"
        />
      </Wrap>,
    );
    expect(getByText('Error copy')).toBeTruthy();
    expect(queryByText('Helper copy')).toBeNull();
  });

  it('`error` is an accepted alias of `errorText`', () => {
    const { getByText } = render(
      <Wrap>
        <MobileInput label="Email" value="" onChangeText={() => {}} error="Alias error" />
      </Wrap>,
    );
    expect(getByText('Alias error')).toBeTruthy();
  });
});

describe('MobileInput — right icon slot', () => {
  it('fires onRightIconPress when the right icon is pressed', () => {
    const onRightIconPress = vi.fn();
    const { getByText } = render(
      <Wrap>
        <MobileInput
          label="Password"
          value="secret"
          onChangeText={() => {}}
          secureTextEntry
          rightIcon={<Text>eye</Text>}
          onRightIconPress={onRightIconPress}
        />
      </Wrap>,
    );
    fireEvent.click(getByText('eye'));
    expect(onRightIconPress).toHaveBeenCalledTimes(1);
  });
});
