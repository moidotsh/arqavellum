// __tests__/components/MobileDialog.test.tsx
//
// Component-level render + interaction tests for MobileDialog.
//   - open=false renders nothing
//   - open renders the title + body children
//   - Backdrop tap ("Close dialog") fires onOpenChange(false)
//   - Header X ("Dismiss") fires onOpenChange(false)
//   - Primary action button fires onPrimary
//   - visible/onClose alias pair behaves the same on backdrop tap
//
// RN mock note: Modal renders as a host <modal> element (same handling
// as MobileSheet.test.tsx).

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../../context';
import { MobileDialog } from '../../components/MobilePremium/MobileDialog';

function Wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('MobileDialog — open state', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <Wrap>
        <MobileDialog open={false} onOpenChange={() => {}} title="Confirm">
          <span>Dialog body</span>
        </MobileDialog>
      </Wrap>,
    );
    expect(container.querySelector('modal')).toBeNull();
    expect(container.textContent).not.toContain('Dialog body');
  });

  it('renders the title and children when open', () => {
    const { getByText, container } = render(
      <Wrap>
        <MobileDialog open onOpenChange={() => {}} title="Delete item">
          <span>This cannot be undone.</span>
        </MobileDialog>
      </Wrap>,
    );
    expect(container.querySelector('modal')).not.toBeNull();
    expect(getByText('Delete item')).toBeTruthy();
    expect(getByText('This cannot be undone.')).toBeTruthy();
  });
});

describe('MobileDialog — close affordances', () => {
  it('backdrop tap fires onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileDialog open onOpenChange={onOpenChange} title="Confirm">
          <span>Body</span>
        </MobileDialog>
      </Wrap>,
    );
    const backdrop = container.querySelector('[accessibilitylabel="Close dialog"]');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('header X button fires onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileDialog open onOpenChange={onOpenChange} title="Confirm">
          <span>Body</span>
        </MobileDialog>
      </Wrap>,
    );
    const dismiss = container.querySelector('[accessibilitylabel="Dismiss"]');
    expect(dismiss).not.toBeNull();
    fireEvent.click(dismiss as Element);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('falls back to onClose() when no onOpenChange is supplied (visible alias)', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Wrap>
        <MobileDialog visible onClose={onClose} title="Confirm">
          <span>Body</span>
        </MobileDialog>
      </Wrap>,
    );
    // `visible` drives the open state — the modal host is mounted.
    expect(container.querySelector('modal')).not.toBeNull();
    fireEvent.click(container.querySelector('[accessibilitylabel="Close dialog"]') as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('MobileDialog — primary action', () => {
  it('fires onPrimary when the primary button is pressed', () => {
    const onPrimary = vi.fn();
    const { getByText } = render(
      <Wrap>
        <MobileDialog
          open
          onOpenChange={() => {}}
          title="Delete item"
          primaryLabel="Delete"
          onPrimary={onPrimary}
        >
          <span>Body</span>
        </MobileDialog>
      </Wrap>,
    );
    fireEvent.click(getByText('Delete'));
    expect(onPrimary).toHaveBeenCalledTimes(1);
  });

  it('renders a dismiss-only dialog (no footer) when onPrimary is omitted', () => {
    const { container } = render(
      <Wrap>
        <MobileDialog open onOpenChange={() => {}} title="Heads up">
          <span>Body</span>
        </MobileDialog>
      </Wrap>,
    );
    // No primary handler + no secondary → no footer. The primary button
    // would render its default 'OK' label.
    expect(container.textContent).not.toContain('OK');
  });
});
