import { RGB } from '../types';

export function clamp01(val: number): number {
  return Math.max(0.0, Math.min(1.0, val));
}

export function gamma(val: number, g = 2.2): number {
  return Math.pow(clamp01(val), g);
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
  h = ((h % 1) + 1) % 1;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    case 5: return [v, p, q];
    default: return [0, 0, 0];
  }
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (isNaN(bigint)) return [1, 1, 1];
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r / 255, g / 255, b / 255];
}

export function lerpColor(c1: RGB, c2: RGB, alpha: number): RGB {
  const a = clamp01(alpha);
  const inv = 1.0 - a;
  return [
    c1[0] * inv + c2[0] * a,
    c1[1] * inv + c2[1] * a,
    c1[2] * inv + c2[2] * a,
  ];
}

export function blendFrames(f1: RGB[], f2: RGB[], alpha: number): RGB[] {
  const a = clamp01(alpha);
  const inv = 1.0 - a;
  const len = Math.min(f1.length, f2.length);
  const out: RGB[] = new Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = [
      f1[i][0] * inv + f2[i][0] * a,
      f1[i][1] * inv + f2[i][1] * a,
      f1[i][2] * inv + f2[i][2] * a,
    ];
  }
  return out;
}
