import { RGB } from '../types';

export class ScreenCaptureDriver {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isActive = false;

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
  }

  public getRunning(): boolean {
    return this.isActive;
  }

  /**
   * Sample screen perimeter colors and map them across the 1D strip (e.g., bottom, left, top, right edges)
   */
  public sampleFrame(numLeds: number): RGB[] {
    const pixels: RGB[] = new Array(numLeds).fill([0, 0, 0]);
    if (!this.isActive || !this.video || !this.ctx || !this.canvas) {
      return pixels;
    }

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    this.ctx.drawImage(this.video, 0, 0, cw, ch);
    const imgData = this.ctx.getImageData(0, 0, cw, ch).data;

    // Sample across the perimeter (bottom-left -> top-left -> top-right -> bottom-right)
    for (let i = 0; i < numLeds; i++) {
      const fraction = i / numLeds;
      let x = 0;
      let y = 0;

      // 4-side perimeter unrolling:
      if (fraction < 0.25) {
        // Left edge going up
        x = 2;
        y = Math.floor(ch - (fraction / 0.25) * ch);
      } else if (fraction < 0.75) {
        // Top edge going across
        x = Math.floor(((fraction - 0.25) / 0.5) * cw);
        y = 2;
      } else {
        // Right edge going down
        x = cw - 3;
        y = Math.floor(((fraction - 0.75) / 0.25) * ch);
      }

      x = Math.max(0, Math.min(cw - 1, x));
      y = Math.max(0, Math.min(ch - 1, y));

      const idx = (y * cw + x) * 4;
      const r = imgData[idx] / 255;
      const g = imgData[idx + 1] / 255;
      const b = imgData[idx + 2] / 255;

      pixels[i] = [r, g, b];
    }

    return pixels;
  }
}
