import { RGB } from '../types';
import { clamp01 } from '../engine/math';

export class VirtualStrip {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private hoveredIndex: number | null = null;

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

  private resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(300, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(120, Math.floor(rect.height * dpr));
  }

  private setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      this.hoveredIndex = Math.floor(x * 150);
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredIndex = null;
    });
  }

  public render(pixels: RGB[], brightness = 1.0) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    const numLeds = pixels.length;

    // Background: dark aluminum PCB rail
    ctx.clearRect(0, 0, w, h);

    const padX = w * 0.03;
    const stripW = w - padX * 2;
    const stripY = h * 0.45;
    const ledHeight = h * 0.22;
    const ledStep = stripW / numLeds;
    const ledWidth = Math.max(2, Math.min(ledStep * 0.8, 14));

    // 1. Ambient wall bounce / diffused reflection
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

    // 2. PCB Strip Chassis
    ctx.fillStyle = '#0f1118';
    ctx.strokeStyle = '#1e2230';
    ctx.lineWidth = 2;
    const chassisH = ledHeight + 12;
    const chassisY = stripY - chassisH / 2;
    ctx.beginPath();
    ctx.roundRect(padX - 4, chassisY, stripW + 8, chassisH, 6);
    ctx.fill();
    ctx.stroke();

    // Trace line on PCB
    ctx.strokeStyle = '#181d2c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, stripY);
    ctx.lineTo(padX + stripW, stripY);
    ctx.stroke();

    // 3. Individual LEDs
    for (let i = 0; i < numLeds; i++) {
      const x = padX + i * ledStep + (ledStep - ledWidth) / 2;
      const y = stripY - ledHeight / 2;
      const [r, g, b] = pixels[i];

      const cr = Math.round(clamp01(r * brightness) * 255);
      const cg = Math.round(clamp01(g * brightness) * 255);
      const cb = Math.round(clamp01(b * brightness) * 255);

      // Solder pads
      ctx.fillStyle = '#262d40';
      ctx.fillRect(x - 1, y - 2, ledWidth + 2, ledHeight + 4);

      // LED package casing (white/gray frame)
      ctx.fillStyle = '#11131a';
      ctx.fillRect(x, y, ledWidth, ledHeight);

      // Emitting diode lens
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(x + 1, y + 1, Math.max(1, ledWidth - 2), Math.max(1, ledHeight - 2));

      // Overdrive white hot-spot in center
      if (cr > 200 && cg > 200 && cb > 200) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(x + ledWidth * 0.3, y + ledHeight * 0.3, ledWidth * 0.4, ledHeight * 0.4);
      }

      // Tick markers every 10 LEDs
      if (i % 10 === 0 && h > 80) {
        ctx.fillStyle = '#475569';
        ctx.font = `${Math.max(9, Math.floor(h * 0.1))}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${i}`, x + ledWidth / 2, chassisY + chassisH + 14);
      }
    }

    // 4. Hover tooltip
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
