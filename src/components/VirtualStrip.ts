import { PreviewLayout, RGB } from '../types';
import { clamp01 } from '../engine/math';

export class VirtualStrip {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private hoveredIndex: number | null = null;
  private lastNumLeds = 150;
  private layout: PreviewLayout = 'strip';
  private fourSided = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block rounded-xl';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.setupEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  public setLayout(layout: PreviewLayout, fourSided = false) {
    this.layout = layout;
    this.fourSided = fourSided;
  }

  private resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(300, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(120, Math.floor(rect.height * dpr));
  }

  private setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.layout !== 'strip') {
        this.hoveredIndex = null;
        return;
      }
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      this.hoveredIndex = Math.max(0, Math.min(this.lastNumLeds - 1, Math.floor(x * this.lastNumLeds)));
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredIndex = null;
    });
  }

  private renderMonitorPerimeter(pixels: RGB[], brightness: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    const numLeds = pixels.length;
    ctx.clearRect(0, 0, w, h);

    const mw = Math.min(w * 0.62, h * 2.1);
    const mh = Math.min(h * 0.66, mw * 0.56);
    const mx = (w - mw) / 2;
    const my = (h - mh) / 2 - h * 0.04;

    const coords: Array<[number, number]> = new Array(numLeds);
    for (let i = 0; i < numLeds; i++) {
      const f = (i + 0.5) / numLeds;
      if (!this.fourSided) {
        if (f < 0.25) coords[i] = [mx, my + mh - (f / 0.25) * mh];
        else if (f < 0.75) coords[i] = [mx + ((f - 0.25) / 0.5) * mw, my];
        else coords[i] = [mx + mw, my + ((f - 0.75) / 0.25) * mh];
      } else {
        if (f < 0.2) coords[i] = [mx, my + mh - (f / 0.2) * mh];
        else if (f < 0.5) coords[i] = [mx + ((f - 0.2) / 0.3) * mw, my];
        else if (f < 0.7) coords[i] = [mx + mw, my + ((f - 0.5) / 0.2) * mh];
        else coords[i] = [mx + mw - ((f - 0.7) / 0.3) * mw, my + mh];
      }
    }

    // 1. Diffused ambient wall halo
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const step = Math.max(1, Math.floor(numLeds / 40));
    const rad = Math.max(24, mh * 0.45);
    for (let i = 0; i < numLeds; i += step) {
      const [px, py] = coords[i];
      const [r, g, b] = pixels[i];
      const lum = (r * 0.3 + g * 0.59 + b * 0.11) * brightness * 0.55;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, rad);
      grad.addColorStop(0, `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${lum})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    ctx.restore();

    // 2. Monitor bezel + stand
    ctx.fillStyle = '#090c14';
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mx + mw * 0.45, my + mh, mw * 0.10, mh * 0.16);
    ctx.beginPath();
    ctx.roundRect(mx + mw * 0.34, my + mh + mh * 0.14, mw * 0.32, Math.max(5, mh * 0.07), 4);
    ctx.fill();

    // Center label
    ctx.fillStyle = 'rgba(148,163,184,0.55)';
    ctx.font = `${Math.max(11, Math.floor(h * 0.08))}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `${this.fourSided ? '4-SIDED' : '3-SIDED'} MONITOR PERIMETER (${numLeds} LEDs)`,
      w / 2,
      my + mh / 2 + 4
    );

    // 3. Individual perimeter LEDs (LED #0 marked with bright ring)
    const dotR = Math.max(2, Math.min(5, (mw / numLeds) * 1.4));
    for (let i = 0; i < numLeds; i++) {
      const [px, py] = coords[i];
      const [r, g, b] = pixels[i];
      ctx.fillStyle = `rgb(${Math.round(clamp01(r * brightness) * 255)}, ${Math.round(clamp01(g * brightness) * 255)}, ${Math.round(clamp01(b * brightness) * 255)})`;
      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    if (numLeds > 0) {
      const [sx, sy] = coords[0];
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, dotR + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  public render(pixels: RGB[], brightness = 1.0) {
    const numLeds = pixels.length;
    this.lastNumLeds = Math.max(1, numLeds);

    if (this.layout === 'monitor') {
      this.renderMonitorPerimeter(pixels, brightness);
      return;
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    const padX = w * 0.03;
    const stripW = w - padX * 2;
    const stripY = h * 0.45;
    const ledHeight = h * 0.22;
    const ledStep = stripW / numLeds;
    const ledWidth = Math.max(2, Math.min(ledStep * 0.8, 14));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const sampleStep = Math.max(1, Math.floor(numLeds / 32));
    for (let i = 0; i < numLeds; i += sampleStep) {
      const x = padX + i * ledStep + ledWidth / 2;
      const [r, g, b] = pixels[i];
      const rad = h * 0.7;
      const grad = ctx.createRadialGradient(x, stripY, 0, x, stripY, rad);
      const intensity = (r * 0.3 + g * 0.59 + b * 0.11) * brightness * 0.45;
      grad.addColorStop(0, `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${intensity})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - rad, stripY - rad, rad * 2, rad * 2);
    }
    ctx.restore();

    ctx.fillStyle = '#0f1118';
    ctx.strokeStyle = '#1e2230';
    ctx.lineWidth = 2;
    const chassisH = ledHeight + 12;
    const chassisY = stripY - chassisH / 2;
    ctx.beginPath();
    ctx.roundRect(padX - 4, chassisY, stripW + 8, chassisH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#181d2c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, stripY);
    ctx.lineTo(padX + stripW, stripY);
    ctx.stroke();

    for (let i = 0; i < numLeds; i++) {
      const x = padX + i * ledStep + (ledStep - ledWidth) / 2;
      const y = stripY - ledHeight / 2;
      const [r, g, b] = pixels[i];

      const cr = Math.round(clamp01(r * brightness) * 255);
      const cg = Math.round(clamp01(g * brightness) * 255);
      const cb = Math.round(clamp01(b * brightness) * 255);

      ctx.fillStyle = '#262d40';
      ctx.fillRect(x - 1, y - 2, ledWidth + 2, ledHeight + 4);
      ctx.fillStyle = '#11131a';
      ctx.fillRect(x, y, ledWidth, ledHeight);
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(x + 1, y + 1, Math.max(1, ledWidth - 2), Math.max(1, ledHeight - 2));

      if (cr > 200 && cg > 200 && cb > 200) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(x + ledWidth * 0.3, y + ledHeight * 0.3, ledWidth * 0.4, ledHeight * 0.4);
      }

      if (i % 10 === 0 && h > 80) {
        ctx.fillStyle = '#475569';
        ctx.font = `${Math.max(9, Math.floor(h * 0.1))}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${i}`, x + ledWidth / 2, chassisY + chassisH + 14);
      }
    }

    if (this.hoveredIndex !== null && this.hoveredIndex >= 0 && this.hoveredIndex < numLeds) {
      const idx = this.hoveredIndex;
      const x = padX + idx * ledStep;
      const [r, g, b] = pixels[idx];
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      const tipText = `LED #${idx} | RGB(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      ctx.font = '11px sans-serif';
      const textW = ctx.measureText(tipText).width;
      const tx = Math.max(10, Math.min(w - textW - 20, x - textW / 2));
      const ty = chassisY - 14;
      ctx.beginPath();
      ctx.roundRect(tx - 6, ty - 14, textW + 12, 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(tipText, tx, ty);
    }
  }
}
