// scripts/generate-print-kit.ts
//
// The print-kit generator — one bun script, zero dependencies, writes
// `_print/print-kit.html`: a poster and a sticker sheet carrying the
// printed-QR code for the app's landing path (CLAUDE.md invariant 13).
// The encoder is a from-scratch QR version 1-L (21×21, byte mode,
// capacity exactly 17 bytes) so one extra character ERRORS — the
// smallest-scannable-grid discipline is a property of the tool, not a
// habit. Consumers forking scan attribution coin more 17-byte paths
// (see QR_LANDING_PATHS in utils/webAnalytics.ts) and print one sheet
// per path.
//
// The landing URL comes from PRINT_QR_URL (env) — it must fit 17 bytes
// TOTAL (https:// + domain + path). Real products buy a short print
// domain for exactly this reason; a long URL forces a denser grid that
// scans worse at poster distance, and this tool refuses.
//
// Usage: PRINT_QR_URL='https://sh.rt/qr' bun run scripts/generate-print-kit.ts
// Output: _print/print-kit.html (gitignored) → open in a browser →
// Print → Save as PDF (A4, margins: none, background graphics: on).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { theme } from '../constants/theme';
import { APP_DISPLAY_NAME } from '../constants/displayName';

/** The byte ceiling of QR version 1-L byte mode — never grows. */
export const QR_V1L_MAX_BYTES = 17;

/**
 * Resolve the printed landing URL. Env first (PRINT_QR_URL); throws
 * with the discipline in the message when unset or over capacity — a
 * silent fallback would print a code nobody scanned on purpose.
 */
export function resolvePrintUrl(): string {
  const url = process.env.PRINT_QR_URL;
  if (url == null || url === '') {
    throw new Error(
      'Set PRINT_QR_URL (e.g. PRINT_QR_URL=https://sh.rt/qr) — the printed code ' +
        'encodes exactly that URL and QR v1-L holds 17 bytes total.',
    );
  }
  return url;
}

// ── The QR encoder (version 1-L, byte mode) ──────────────────────────

const SIZE = 21; // version 1
const DATA_CODEWORDS = 19; // v1-L: 19 data + 7 EC = 26
const EC_CODEWORDS = 7;
const MAX_BYTES = QR_V1L_MAX_BYTES; // 4 + 8 + 17×8 = 148 bits → 19 bytes with terminator

/** GF(256) arithmetic over the QR prime polynomial 0x11D. */
function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

/** Reed–Solomon generator polynomial of the given degree (little-endian). */
function rsGenerator(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1; // the monomial x^0
  // (x − α^0)(x − α^1)…(x − α^(degree−1)) over GF(256).
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

/** The 7 error-correction codewords for a 19-codeword block. */
function rsEc(data: number[]): number[] {
  const divisor = rsGenerator(EC_CODEWORDS);
  const result = new Array<number>(EC_CODEWORDS).fill(0);
  for (const b of data) {
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[EC_CODEWORDS - 1] = 0;
    for (let i = 0; i < EC_CODEWORDS; i++) result[i] ^= gfMul(divisor[i], factor);
  }
  return result;
}

interface QrMatrix {
  /** Dark modules; null entries are function patterns placed later. */
  modules: (boolean | null)[][];
  /** Which modules are function patterns (never masked, never data). */
  isFunction: boolean[][];
}

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

function setFunctionModule(qr: QrMatrix, x: number, y: number, dark: boolean): void {
  qr.modules[y][x] = dark;
  qr.isFunction[y][x] = true;
}

function drawFinderPattern(qr: QrMatrix, cx: number, cy: number): void {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
        setFunctionModule(qr, x, y, dist !== 2 && dist !== 4);
      }
    }
  }
}

function drawFormatBits(qr: QrMatrix, mask: number): void {
  const data = (0b01 << 3) | mask; // 01 = error level L
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  for (let i = 0; i <= 5; i++) setFunctionModule(qr, 8, i, getBit(bits, i));
  setFunctionModule(qr, 8, 7, getBit(bits, 6));
  setFunctionModule(qr, 8, 8, getBit(bits, 7));
  setFunctionModule(qr, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) setFunctionModule(qr, 14 - i, 8, getBit(bits, i));
  for (let i = 0; i < 8; i++) setFunctionModule(qr, SIZE - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) setFunctionModule(qr, 8, SIZE - 15 + i, getBit(bits, i));
  setFunctionModule(qr, 8, SIZE - 8, true); // the always-dark module
}

function drawFunctionPatterns(qr: QrMatrix): void {
  for (let i = 0; i < SIZE; i++) {
    setFunctionModule(qr, 6, i, i % 2 === 0);
    setFunctionModule(qr, i, 6, i % 2 === 0);
  }
  drawFinderPattern(qr, 3, 3);
  drawFinderPattern(qr, SIZE - 4, 3);
  drawFinderPattern(qr, 3, SIZE - 4);
  drawFormatBits(qr, 0); // reserved now; rewritten per mask
}

function drawCodewords(qr: QrMatrix, codewords: number[]): void {
  let i = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < SIZE; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? SIZE - 1 - vert : vert;
        if (!qr.isFunction[y][x] && i < codewords.length * 8) {
          qr.modules[y][x] = getBit(codewords[i >>> 3], 7 - (i & 7));
          i++;
        }
      }
    }
  }
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return (x * y) % 2 + (x * y) % 3 === 0;
    case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
    default: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
  }
}

function applyMask(qr: QrMatrix, mask: number): void {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!qr.isFunction[y][x] && maskBit(mask, x, y)) {
        qr.modules[y][x] = !(qr.modules[y][x] ?? false);
      }
    }
  }
}

function penalty(qr: QrMatrix): number {
  let result = 0;
  const dark = (x: number, y: number) => qr.modules[y][x] === true;
  // N1 — runs of five or more same-colour modules in rows and columns.
  for (let y = 0; y < SIZE; y++) {
    let run = 1;
    for (let x = 1; x < SIZE; x++) {
      if (dark(x, y) === dark(x - 1, y)) run++;
      else { if (run >= 5) result += 3 + (run - 5); run = 1; }
    }
    if (run >= 5) result += 3 + (run - 5);
  }
  for (let x = 0; x < SIZE; x++) {
    let run = 1;
    for (let y = 1; y < SIZE; y++) {
      if (dark(x, y) === dark(x, y - 1)) run++;
      else { if (run >= 5) result += 3 + (run - 5); run = 1; }
    }
    if (run >= 5) result += 3 + (run - 5);
  }
  // N2 — 2×2 blocks of a single colour.
  for (let y = 0; y < SIZE - 1; y++) {
    for (let x = 0; x < SIZE - 1; x++) {
      const c = dark(x, y);
      if (c === dark(x + 1, y) && c === dark(x, y + 1) && c === dark(x + 1, y + 1)) result += 3;
    }
  }
  // N3 — finder-like 1-1-3-1-1 patterns with four light modules beside
  // them, in rows and columns (out-of-range counts as light).
  const FINDER_RUN = [true, false, true, true, true, false, true];
  for (let y = 0; y < SIZE; y++) {
    for (let x = -4; x + 6 < SIZE + 4; x++) {
      const at = (i: number): boolean => {
        const xx = x + i;
        return xx >= 0 && xx < SIZE ? dark(xx, y) : false;
      };
      const before = [0, 1, 2, 3].every((i) => x - 4 + i < 0 || !at(i - 4));
      const after = [0, 1, 2, 3].every((i) => x + 7 + i >= SIZE || !at(i + 7));
      if ((before || after) && FINDER_RUN.every((v, i) => at(i) === v)) result += 40;
    }
  }
  for (let x = 0; x < SIZE; x++) {
    for (let y = -4; y + 6 < SIZE + 4; y++) {
      const at = (i: number): boolean => {
        const yy = y + i;
        return yy >= 0 && yy < SIZE ? dark(x, yy) : false;
      };
      const before = [0, 1, 2, 3].every((i) => y - 4 + i < 0 || !at(i - 4));
      const after = [0, 1, 2, 3].every((i) => y + 7 + i >= SIZE || !at(i + 7));
      if ((before || after) && FINDER_RUN.every((v, i) => at(i) === v)) result += 40;
    }
  }
  // N4 — the dark-module proportion.
  let darkCount = 0;
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (dark(x, y)) darkCount++;
  const percent = (darkCount * 100) / (SIZE * SIZE);
  result += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return result;
}

/**
 * Encode a URL (≤ 17 bytes) as a QR version 1-L matrix. Longer input
 * throws — the grid can never grow. `forceMask` pins the mask (the
 * self-check compares against a reference encoder mask-for-mask);
 * production picks the best penalty.
 */
export function encodeQrV1L(text: string, forceMask?: number): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));
  if (bytes.length > MAX_BYTES) {
    throw new Error(
      `"${text}" is ${bytes.length} bytes — QR v1-L holds ${MAX_BYTES}. ` +
        'Print a short landing path (buy the short domain if you must); a longer ' +
        'URL forces a denser grid that scans worse at poster distance.',
    );
  }
  // Bit stream: mode 0100, 8-bit count, data, terminator, pad to 19.
  const bits: number[] = [];
  const push = (value: number, width: number) => {
    for (let i = width - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, 8);
  for (const b of bytes) push(b, 8);
  const capacity = DATA_CODEWORDS * 8;
  push(0, Math.min(4, capacity - bits.length));
  while (bits.length < capacity) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((acc, b) => (acc << 1) | b, 0));
  }
  const codewords = [...data, ...rsEc(data)];

  const base: QrMatrix = {
    modules: Array.from({ length: SIZE }, () => new Array<boolean | null>(SIZE).fill(null)),
    isFunction: Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false)),
  };
  drawFunctionPatterns(base);
  drawCodewords(base, codewords);

  let best: boolean[][] | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const trial: QrMatrix = {
      modules: base.modules.map((row) => [...row]),
      isFunction: base.isFunction.map((row) => [...row]),
    };
    applyMask(trial, mask);
    drawFormatBits(trial, mask);
    const score = penalty(trial);
    if (forceMask === mask) return trial.modules.map((row) => row.map((m) => m === true));
    if (score < bestScore) {
      bestScore = score;
      best = trial.modules.map((row) => row.map((m) => m === true));
    }
  }
  return best as boolean[][];
}

// ── The kit HTML — the starter's neutral print language ───────────────
// The poster's copy is placeholder-by-design (like the seed data in a
// consumer): replace the strings with the product's own; the layout,
// the code, and the capacity guard are the reusable parts. Brand
// mirrors read the theme's own slots.

/** The QR as an SVG — one path of dark modules on a paper tile. */
function qrSvg(url: string, opts: { quiet?: number; ink?: string; paper?: string } = {}): string {
  const quiet = opts.quiet ?? 4;
  const ink = opts.ink ?? theme.colors.light.text;
  const paper = opts.paper ?? theme.colors.light.background;
  const matrix = encodeQrV1L(url);
  const dim = SIZE + quiet * 2;
  const parts: string[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (matrix[y][x]) parts.push(`M${x + quiet} ${y + quiet}h1v1h-1z`);
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" ` +
    `shape-rendering="crispEdges" role="img" aria-label="QR — ${url}">` +
    `<rect width="${dim}" height="${dim}" fill="${paper}"/>` +
    `<path d="${parts.join('')}" fill="${ink}"/></svg>`
  );
}

function poster(url: string, domain: string): string {
  const wordmark = APP_DISPLAY_NAME.toUpperCase();
  return `<section class="poster">
  <div class="poster-eyebrow">${wordmark}</div>
  <h1 class="poster-head">SCAN TO OPEN.</h1>
  <div class="poster-rule"></div>
  <p class="poster-sub">Placeholder poster copy — replace with the product's own (the layout, the code, and the 17-byte guard are the reusable parts).</p>
  <div class="poster-qr">${qrSvg(url)}</div>
  <div class="poster-cta">SCAN TO OPEN</div>
  <div class="poster-typein">${domain} · ${wordmark}</div>
</section>`;
}

function stickerSheet(url: string, wordmark: string, domain: string, size: number, cols: number, rows: number): string {
  const stickers: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      stickers.push(
        `<div class="sticker" style="width:${size}mm;height:${size}mm">
          <div class="sticker-qr" style="width:${size * 0.62}mm">${qrSvg(url)}</div>
          <div class="sticker-word">${wordmark.replace(/ /g, '&nbsp;')}</div>
          <div class="sticker-type">${domain}</div>
        </div>`,
      );
    }
  }
  return `<section class="sheet">
  <div class="sheet-title">STICKERS · ${size}mm · ${cols}×${rows}</div>
  <div class="sheet-grid">${stickers.join('')}</div>
</section>`;
}

function kitHtml(url: string): string {
  const domain = url.replace(/^https?:\/\//, '').split('/')[0];
  const wordmark = APP_DISPLAY_NAME.toUpperCase();
  const ink = theme.colors.light.text;
  const paper = theme.colors.light.background;
  const brand = theme.colors.light.brand;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${APP_DISPLAY_NAME} — print kit</title>
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; background: #e8e8e8; }
  section { background: ${paper}; margin: 10mm auto; width: 200mm; min-height: 287mm; position: relative; page-break-after: always; }
  .poster { padding: 22mm 18mm; display: flex; flex-direction: column; align-items: flex-start; }
  .poster-eyebrow { font-size: 12pt; font-weight: 700; letter-spacing: 0.35em; color: ${ink}; }
  .poster-head { font-size: 64pt; line-height: 1.02; font-weight: 800; color: ${ink}; margin-top: 14mm; letter-spacing: 0.01em; }
  .poster-rule { width: 42mm; height: 3.2mm; background: ${brand}; margin: 12mm 0 10mm; }
  .poster-sub { font-size: 14pt; font-weight: 700; line-height: 1.5; color: ${ink}; max-width: 130mm; }
  .poster-qr { margin: 14mm auto 0; width: 62mm; }
  .poster-qr svg { width: 100%; height: auto; display: block; }
  .poster-cta { margin: 8mm auto 0; font-size: 13pt; font-weight: 700; letter-spacing: 0.3em; color: ${brand}; text-align: center; }
  .poster-typein { margin: 2mm auto 0; font-size: 15pt; font-weight: 700; color: ${ink}; text-align: center; }
  .sheet { padding: 12mm; min-height: auto; }
  .sheet-title { font-size: 9pt; font-weight: 700; letter-spacing: 0.25em; color: ${ink}; margin-bottom: 6mm; }
  .sheet-grid { display: flex; flex-wrap: wrap; gap: 4mm; }
  .sticker { border: 0.3mm dashed #b9b9b9; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2mm; }
  .sticker-qr svg { width: 100%; height: auto; display: block; }
  .sticker-word { font-size: 7pt; font-weight: 800; letter-spacing: 0.12em; color: ${ink}; }
  .sticker-type { font-size: 6pt; font-weight: 700; color: ${brand}; }
</style>
</head>
<body>
${poster(url, domain)}
${stickerSheet(url, wordmark, domain, 40, 4, 6)}
${stickerSheet(url, wordmark, domain, 28, 5, 8)}
</body>
</html>
`;
}

const isMain = (import.meta as { main?: boolean }).main === true;
if (isMain) {
  const url = resolvePrintUrl();
  const outDir = join(import.meta.dir, '..', '_print');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'print-kit.html');
  writeFileSync(outPath, kitHtml(url));
  console.log(`Print kit written: ${outPath}`);
  console.log('Open in a browser → Print → Save as PDF (A4, margins none, background graphics on).');
  console.log(`Landing URL encoded: ${url} (${url.length} bytes of 17)`);
}
