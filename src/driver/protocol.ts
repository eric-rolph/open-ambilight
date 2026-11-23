import { RGB } from '../types';
import { clamp01, gamma } from '../engine/math';

export interface FrameEncodeOptions {
  brightness: number;
  colorOrder?: 'RGB' | 'GRB' | 'BGR';
  applyGamma?: boolean;
  whiteBalance?: [number, number, number];
  reverse?: boolean;
  startOffset?: number;
}

/**
 * Compute minimum inter-frame interval (ms) so serial writes never overrun the UART buffer
 * (8N1 = 10 bits per byte, plus 2 ms turnaround margin, capped at >= 16 ms / ~60 FPS).
 */
export function computeMinFrameIntervalMs(numLeds: number, baudRate: number): number {
  const totalBytes = 6 + Math.max(1, numLeds) * 3;
  const safeBaud = Math.max(9600, baudRate);
  return Math.max(16, Math.ceil(((totalBytes * 10) / safeBaud) * 1000) + 2);
}

/**
 * Transform pixel array according to physical strip start-offset and reverse orientation.
 */
export function remapStripPixels(pixels: RGB[], reverse = false, startOffset = 0): RGB[] {
  const n = pixels.length;
  if (n === 0) return [];
  const shift = ((startOffset % n) + n) % n;
  if (!reverse && shift === 0) return pixels;

  const out: RGB[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const srcIdx = reverse ? (n - 1 - i) : i;
    const mapped = (srcIdx + shift) % n;
    out[i] = pixels[mapped];
  }
  return out;
}

/**
 * Encode an RGB pixel frame into an Adalight serial packet:
 *   Bytes 0..2: 'A' (0x41), 'd' (0x64), 'a' (0x61)
 *   Bytes 3..4: (LED count - 1) big-endian uint16
 *   Byte  5:    hi ^ lo ^ 0x55 XOR checksum
 *   Bytes 6..:  3 * numLeds color bytes in requested colorOrder
 */
export function encodeAdalightFrame(
  pixels: RGB[],
  options: FrameEncodeOptions,
  reuseBuffer?: Uint8Array | null
): Uint8Array {
  const numLeds = pixels.length;
  const totalBytes = 6 + numLeds * 3;
  const buffer = reuseBuffer && reuseBuffer.length === totalBytes ? reuseBuffer : new Uint8Array(totalBytes);

  const count = Math.max(0, numLeds - 1);
  const hi = (count >> 8) & 0xff;
  const lo = count & 0xff;
  const chk = hi ^ lo ^ 0x55;

  buffer[0] = 0x41; // 'A'
  buffer[1] = 0x64; // 'd'
  buffer[2] = 0x61; // 'a'
  buffer[3] = hi;
  buffer[4] = lo;
  buffer[5] = chk;

  const ordered = remapStripPixels(pixels, options.reverse ?? false, options.startOffset ?? 0);
  const colorOrder = options.colorOrder ?? 'RGB';
  const applyGamma = options.applyGamma ?? true;
  const [wbR, wbG, wbB] = options.whiteBalance ?? [1, 1, 1];
  const br = options.brightness;

  let offset = 6;
  for (let i = 0; i < numLeds; i++) {
    let r = ordered[i][0] * br * wbR;
    let g = ordered[i][1] * br * wbG;
    let b = ordered[i][2] * br * wbB;

    if (applyGamma) {
      r = gamma(r, 2.2);
      g = gamma(g, 2.2);
      b = gamma(b, 2.2);
    }

    const rb = Math.floor(clamp01(r) * 255);
    const gb = Math.floor(clamp01(g) * 255);
    const bb = Math.floor(clamp01(b) * 255);

    if (colorOrder === 'GRB') {
      buffer[offset++] = gb;
      buffer[offset++] = rb;
      buffer[offset++] = bb;
    } else if (colorOrder === 'BGR') {
      buffer[offset++] = bb;
      buffer[offset++] = gb;
      buffer[offset++] = rb;
    } else {
      buffer[offset++] = rb;
      buffer[offset++] = gb;
      buffer[offset++] = bb;
    }
  }

  return buffer;
}

/**
 * Pure border-zone box averaging + EMA temporal smoothing over RGBA imageData.
 */
export function samplePerimeterFromImageData(
  imgData: Uint8ClampedArray | Uint8Array,
  cw: number,
  ch: number,
  numLeds: number,
  fourSides: boolean,
  prevSmoothed: RGB[],
  smoothingAlpha = 0.35
): RGB[] {
  const out: RGB[] = new Array(numLeds);
  const resetEma = prevSmoothed.length !== numLeds;
  const zoneDepth = Math.max(2, Math.min(10, Math.floor(Math.min(cw, ch) * 0.12)));
  const halfSpan = Math.max(1, Math.min(4, Math.floor(Math.min(cw, ch) * 0.05)));

  for (let i = 0; i < numLeds; i++) {
    const fraction = (i + 0.5) / numLeds;
    let x0 = 0, x1 = 0, y0 = 0, y1 = 0;

    if (!fourSides) {
      // 3-sided: Left (up, 25%) -> Top (left-to-right, 50%) -> Right (down, 25%)
      if (fraction < 0.25) {
        const cy = Math.floor(ch - (fraction / 0.25) * ch);
        x0 = 0; x1 = zoneDepth;
        y0 = cy - halfSpan; y1 = cy + halfSpan;
      } else if (fraction < 0.75) {
        const cx = Math.floor(((fraction - 0.25) / 0.5) * cw);
        x0 = cx - halfSpan; x1 = cx + halfSpan;
        y0 = 0; y1 = zoneDepth;
      } else {
        const cy = Math.floor(((fraction - 0.75) / 0.25) * ch);
        x0 = cw - zoneDepth; x1 = cw;
        y0 = cy - halfSpan; y1 = cy + halfSpan;
      }
    } else {
      // 4-sided: Left (20%) -> Top (30%) -> Right (20%) -> Bottom (30%)
      if (fraction < 0.2) {
        const cy = Math.floor(ch - (fraction / 0.2) * ch);
        x0 = 0; x1 = zoneDepth;
        y0 = cy - halfSpan; y1 = cy + halfSpan;
      } else if (fraction < 0.5) {
        const cx = Math.floor(((fraction - 0.2) / 0.3) * cw);
        x0 = cx - halfSpan; x1 = cx + halfSpan;
        y0 = 0; y1 = zoneDepth;
      } else if (fraction < 0.7) {
        const cy = Math.floor(((fraction - 0.5) / 0.2) * ch);
        x0 = cw - zoneDepth; x1 = cw;
        y0 = cy - halfSpan; y1 = cy + halfSpan;
      } else {
        const cx = Math.floor(cw - ((fraction - 0.7) / 0.3) * cw);
        x0 = cx - halfSpan; x1 = cx + halfSpan;
        y0 = ch - zoneDepth; y1 = ch;
      }
    }

    x0 = Math.max(0, Math.min(cw - 1, x0));
    x1 = Math.max(x0 + 1, Math.min(cw, x1));
    y0 = Math.max(0, Math.min(ch - 1, y0));
    y1 = Math.max(y0 + 1, Math.min(ch, y1));

    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let py = y0; py < y1; py++) {
      const rowOffset = py * cw;
      for (let px = x0; px < x1; px++) {
        const idx = (rowOffset + px) * 4;
        rSum += imgData[idx];
        gSum += imgData[idx + 1];
        bSum += imgData[idx + 2];
        count++;
      }
    }

    const inv = count > 0 ? 1 / (count * 255) : 0;
    const r = rSum * inv;
    const g = gSum * inv;
    const b = bSum * inv;

    if (resetEma) {
      out[i] = [r, g, b];
    } else {
      const prev = prevSmoothed[i];
      out[i] = [
        prev[0] + (r - prev[0]) * smoothingAlpha,
        prev[1] + (g - prev[1]) * smoothingAlpha,
        prev[2] + (b - prev[2]) * smoothingAlpha,
      ];
    }
  }
  return out;
}
