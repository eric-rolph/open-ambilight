import { RGB } from '../types';
import { samplePerimeterFromImageData } from './protocol';

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

    this.smoothedPixels = samplePerimeterFromImageData(
      imgData,
      cw,
      ch,
      numLeds,
      fourSides,
      this.smoothedPixels,
      smoothingAlpha
    );
    return this.smoothedPixels;
  }
}
