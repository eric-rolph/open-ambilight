import { RGB } from '../types';

export class ScreenCaptureDriver {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isActive = false;
  private smoothedPixels: RGB[] = [];

  public isSupported(): boolean {
    return 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices;
  }

  public async start(): Promise<boolean> {
    if (!this.isSupported()) {
      alert('Screen capture (getDisplayMedia) is not supported in this browser.');
      return false;
    }

    try {
      this.stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: {
          cursor: 'never',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });

      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.playsInline = true;
      this.video.muted = true;
      await this.video.play();

      this.canvas = document.createElement('canvas');
      this.canvas.width = 160;
      this.canvas.height = 90;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      const videoTrack = this.stream ? this.stream.getVideoTracks()[0] : null;
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stop();
        };
      }

      this.isActive = true;
      return true;
    } catch (err) {
      console.warn('Screen capture cancelled or denied:', err);
      this.stop();
      return false;
    }
  }

  public stop(): void {
    this.isActive = false;
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = null;
    }
    this.canvas = null;
    this.ctx = null;
    this.smoothedPixels = [];
  }

  public getRunning(): boolean {
    return this.isActive;
  }

  /**
   * Sample screen perimeter colors with border-zone box averaging and EMA temporal smoothing.
   * Defaults to 3-sided monitor layout (left -> top -> right); pass fourSides=true for full perimeter.
   */
  public sampleFrame(numLeds: number, smoothingAlpha = 0.35, fourSides = false): RGB[] {
    const pixels: RGB[] = new Array(numLeds);
    if (!this.isActive || !this.video || !this.ctx || !this.canvas) {
      for (let i = 0; i < numLeds; i++) pixels[i] = [0, 0, 0];
      return pixels;
    }

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    this.ctx.drawImage(this.video, 0, 0, cw, ch);
    const imgData = this.ctx.getImageData(0, 0, cw, ch).data;

    const resetEma = this.smoothedPixels.length !== numLeds;
    if (resetEma) {
      this.smoothedPixels = new Array(numLeds);
    }

    const zoneDepth = 10; // px inward from screen edge
    const halfSpan = 4;   // px along edge on each side of center

    for (let i = 0; i < numLeds; i++) {
      const fraction = (i + 0.5) / numLeds;
      let x0 = 0;
      let x1 = 0;
      let y0 = 0;
      let y1 = 0;

      if (!fourSides) {
        // 3-side perimeter: Left (up, 25%) -> Top (left-to-right, 50%) -> Right (down, 25%)
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
        // 4-side perimeter: Left (20%) -> Top (30%) -> Right (20%) -> Bottom (30%)
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

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;
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
        this.smoothedPixels[i] = [r, g, b];
      } else {
        const prev = this.smoothedPixels[i];
        const a = smoothingAlpha;
        this.smoothedPixels[i] = [
          prev[0] + (r - prev[0]) * a,
          prev[1] + (g - prev[1]) * a,
          prev[2] + (b - prev[2]) * a,
        ];
      }
      pixels[i] = this.smoothedPixels[i];
    }

    return pixels;
  }
}
