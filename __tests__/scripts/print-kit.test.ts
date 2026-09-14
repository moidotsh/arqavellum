// __tests__/scripts/print-kit.test.ts
// Goldens for the print kit's QR encoder (scripts/generate-print-kit.ts).
// The encoder was verified mask-for-mask against an independent
// reference implementation of QR v1-L (all 8 masks) and the djb2
// goldens below pin its output. The 17-byte ceiling is CLAUDE.md
// invariant 13's discipline: one more character errors the encoder, so
// the printed grid can never grow.

import { describe, expect, it } from 'vitest';
import { encodeQrV1L, resolvePrintUrl, QR_V1L_MAX_BYTES } from '../../scripts/generate-print-kit';

/** djb2 — a tiny deterministic checksum of the full matrix. */
function matrixHash(matrix: boolean[][]): string {
  let h = 5381;
  for (const row of matrix) {
    for (const cell of row) h = ((h * 33) ^ (cell ? 1 : 0)) >>> 0;
  }
  return h.toString(16);
}

describe('print kit QR encoder (version 1-L, byte mode)', () => {
  it('encodes a 17-byte landing URL to a 21×21 boolean matrix', () => {
    const matrix = encodeQrV1L('https://abc.de/qr');
    expect('https://abc.de/qr'.length).toBe(QR_V1L_MAX_BYTES);
    expect(matrix.length).toBe(21);
    expect(matrix.every((row) => row.length === 21 && row.every((c) => typeof c === 'boolean'))).toBe(true);
  });

  it('pins the encoder output (djb2 of the full matrices)', () => {
    // Regenerate expectations only with a deliberate, re-verified
    // change to the encoder — these ARE the printed codes.
    expect(matrixHash(encodeQrV1L('https://abc.de/qr'))).toBe('ac49f3a5');
    expect(matrixHash(encodeQrV1L('https://a.bb/qr'))).toBe('7c3580e5');
  });

  it('is deterministic — same input, same matrix, best-penalty mask stable', () => {
    expect(matrixHash(encodeQrV1L('https://abc.de/qr'))).toBe(
      matrixHash(encodeQrV1L('https://abc.de/qr')),
    );
  });

  it('draws the structural invariants (finder rings, timing, dark module)', () => {
    const m = encodeQrV1L('https://abc.de/qr');
    // Top-left finder: dark border ring, light ring, dark 3×3 core.
    expect(m[0].slice(0, 7).every(Boolean)).toBe(true);
    expect(m[1][1]).toBe(false);
    expect(m[3][3]).toBe(true);
    // Timing row 6 alternates, dark on even columns.
    expect(m[6][8]).toBe(true);
    expect(m[6][9]).toBe(false);
    // The always-dark module at (row 13, col 8).
    expect(m[13][8]).toBe(true);
  });

  it('errors on an 18th byte — the landing paths can never grow', () => {
    expect(() => encodeQrV1L('https://abcd.ef/qr')).toThrow(/17 bytes|18 bytes/);
  });

  it('resolvePrintUrl demands the env — nothing prints by accident', () => {
    const prev = process.env.PRINT_QR_URL;
    delete process.env.PRINT_QR_URL;
    expect(() => resolvePrintUrl()).toThrow(/PRINT_QR_URL/);
    process.env.PRINT_QR_URL = 'https://sh.rt/qr';
    expect(resolvePrintUrl()).toBe('https://sh.rt/qr');
    if (prev === undefined) delete process.env.PRINT_QR_URL;
    else process.env.PRINT_QR_URL = prev;
  });
});
