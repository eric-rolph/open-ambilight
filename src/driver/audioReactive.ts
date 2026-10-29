import { RGB } from '../types';
import { clamp01, hsvToRgb } from '../engine/math';

export class AudioReactiveDriver {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isActive = false;
  private beatLevel = 0;

  public async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isActive = true;
      return true;
    } catch (err) {
      console.warn('Audio permission denied or unavailable:', err);
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
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  public getRunning(): boolean {
    return this.isActive;
  }

  /**
   * Sample audio spectrum and generate an animated frequency visualizer
   */
  public sampleFrame(numLeds: number, sensitivity = 1.0, t = 0.0): RGB[] {
    const pixels: RGB[] = new Array(numLeds).fill([0, 0, 0]);
    if (!this.isActive || !this.analyser || !this.dataArray) {
      return pixels;
    }

    (this.analyser as any).getByteFrequencyData(this.dataArray);

    // Bass energy (first ~8 bins)
    let bassSum = 0;
    for (let i = 0; i < 8; i++) {
      bassSum += this.dataArray[i];
    }
    const currentBass = (bassSum / (8 * 255)) * sensitivity;
    this.beatLevel = Math.max(currentBass, this.beatLevel * 0.92);

    const binCount = this.analyser.frequencyBinCount;

    // Symmetric dual-sided spectrum from center outward
    const mid = Math.floor(numLeds / 2);
    for (let i = 0; i < mid; i++) {
      const binIdx = Math.floor((i / mid) * (binCount * 0.75));
      const val = ((this.dataArray[binIdx] || 0) / 255) * sensitivity;

      // Color mapping: bass = red/pink, mid = yellow/green, treble = cyan/blue
      const hue = (0.75 - (i / mid) * 0.75 + t * 0.05) % 1.0;
      const rgb = hsvToRgb(hue, 0.95, clamp01(val));

      // Center flash on bass beat
      const bassFlash = i < 8 ? this.beatLevel * 0.8 : 0;
      const r = clamp01(rgb[0] + bassFlash);
      const g = clamp01(rgb[1] + bassFlash * 0.2);
      const b = clamp01(rgb[2] + bassFlash * 0.5);

      pixels[mid - 1 - i] = [r, g, b];
      if (mid + i < numLeds) {
        pixels[mid + i] = [r, g, b];
      }
    }

    return pixels;
  }
}
