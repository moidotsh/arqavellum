// __tests__/navigation/qr.test.tsx
// The printed-QR landing: reports the visit, hands the scanner to the
// home screen, renders nothing while doing it.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { router } from 'expo-router';
import QrRedirectScreen from '../../app/qr';

beforeEach(() => {
  vi.mocked(router.replace).mockClear();
  window.sessionStorage.clear();
  delete window.va;
  delete window.vaq;
});

describe('/qr redirect stub', () => {
  it('reports the visit and replaces with home', () => {
    const { container } = render(<QrRedirectScreen />);
    expect(vi.mocked(router.replace)).toHaveBeenCalledWith('/');
    // A redirect stub renders nothing — no flash of empty chrome.
    expect(container.childElementCount).toBe(0);
  });
});
