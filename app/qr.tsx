// app/qr.tsx
// sb1-exempt — a redirect stub, not a screen: renders nothing.
//
// The landing path for printed QR codes, which encode
// https://<consumer-domain>/qr — at or under QR version 1-L's
// byte-mode capacity (17 bytes), so the printed code stays the
// smallest scannable grid (the URL can never carry parameters). The
// visit is classified 'qr' and reported BEFORE the redirect — child
// effects run before the root layout's, and the root's own report is
// session-guarded, so either order reports the scan exactly once. See
// utils/webAnalytics.ts (invariant 13).

import { useEffect } from 'react';
import { replaceWithHome } from '../navigation';
import { reportVisitSource } from '../utils';

export default function QrRedirectScreen() {
  useEffect(() => {
    reportVisitSource();
    replaceWithHome();
  }, []);
  return null;
}
