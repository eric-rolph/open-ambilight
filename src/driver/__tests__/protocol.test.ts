import { describe, expect, it } from 'vitest';
import {
  computeMinFrameIntervalMs,
  encodeAdalightFrame,
  remapStripPixels,
  samplePerimeterFromImageData,
} from '../protocol';
import { RGB } from '../../types';

describe('Adalight protocol encoding & calibration', () => {
  it('encodes exact Ada header, LED count, and XOR checksum', () => {
    const pixels: RGB[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const buf = encodeAdalightFrame(pixels, {
      brightness: 1.0,
      colorOrder: 'RGB',
      applyGamma: false,
    });
    expect(buf.length).toBe(6 + 3 * 3);
    expect(buf[0]).toBe(0x41); // 'A'
    expect(buf[1]).toBe(0x64); // 'd'
    expect(buf[2]).toBe(0x61); // 'a'
    // count = 3 - 1 = 2 -> hi=0, lo=2, chk=0^2^0x55 = 0x57
    expect(buf[3]).toBe(0x00);
    expect(buf[4]).toBe(0x02);
    expect(buf[5]).toBe(0x57);
    expect(Array.from(buf.slice(6))).toEqual([255, 0, 0, 0, 255, 0, 0, 0, 255]);
  });

  it('respects GRB and BGR color orders plus white-balance gains', () => {
    const pixels: RGB[] = [[1, 0.5, 0.25]];
    const grb = encodeAdalightFrame(pixels, {
      brightness: 1.0,
      colorOrder: 'GRB',
      applyGamma: false,
      whiteBalance: [0.5, 1.0, 1.0],
    });
    expect(grb[6]).toBe(Math.floor(0.5 * 255));   // G
    expect(grb[7]).toBe(Math.floor(0.5 * 255));   // R * 0.5
    expect(grb[8]).toBe(Math.floor(0.25 * 255));  // B

    const bgr = encodeAdalightFrame(pixels, {
      brightness: 1.0,
      colorOrder: 'BGR',
      applyGamma: false,
    });
    expect(bgr[6]).toBe(Math.floor(0.25 * 255));
    expect(bgr[7]).toBe(Math.floor(0.5 * 255));
    expect(bgr[8]).toBe(255);
  });

  it('remaps reverse orientation and circular startOffset accurately', () => {
    const px: RGB[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0]];
    expect(remapStripPixels(px, false, 1)).toEqual([[0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 0]]);
    expect(remapStripPixels(px, true, 0)).toEqual([[1, 1, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]]);
  });

  it('dynamically scales serial frame pacing interval with LED count & baud rate', () => {
    const fast = computeMinFrameIntervalMs(60, 500000);
    const slow = computeMinFrameIntervalMs(300, 115200);
    expect(fast).toBe(16); // clamped to 60 FPS floor
    expect(slow).toBeGreaterThan(75); // 906 bytes @ 115200 baud ~= 79ms + 2ms
  });
});

describe('Screen perimeter border-zone sampling & EMA smoothing', () => {
  it('samples distinct edge colors across 3-sided and 4-sided layouts and smooths transitions', () => {
    const w = 40;
    const h = 20;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        // Left edge red, top edge green, right edge blue, bottom edge yellow
        if (x < 6) { data[i] = 255; }
        else if (x >= w - 6) { data[i + 2] = 255; }
        else if (y < 6) { data[i + 1] = 255; }
        else if (y >= h - 6) { data[i] = 255; data[i + 1] = 255; }
        data[i + 3] = 255;
      }
    }

    const first = samplePerimeterFromImageData(data, w, h, 12, false, [], 0.5);
    expect(first.length).toBe(12);
    expect(first[1][0]).toBeGreaterThan(0.5);  // Left edge -> red
    expect(first[6][1]).toBeGreaterThan(0.5);  // Top edge -> green
    expect(first[10][2]).toBeGreaterThan(0.5); // Right edge -> blue

    // Black frame smoothed with alpha=0.5 halves previous luminance instead of flickering
    const black = new Uint8ClampedArray(w * h * 4);
    const smoothed = samplePerimeterFromImageData(black, w, h, 12, false, first, 0.5);
    expect(smoothed[6][1]).toBeCloseTo(first[6][1] * 0.5, 4);

    // 4-sided layout samples yellow along the bottom segment
    const four = samplePerimeterFromImageData(data, w, h, 20, true, [], 1.0);
    expect(four[17][0]).toBeGreaterThan(0.5);
    expect(four[17][1]).toBeGreaterThan(0.5);
  });
});
