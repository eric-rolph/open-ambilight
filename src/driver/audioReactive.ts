import { AudioVisualizerStyle, RGB } from '../types';
import { clamp01, hsvToRgb } from '../engine/math';

export class AudioReactiveDriver {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isActive = false;
  private beatLevel = 0;
  private waveHistory: RGB[] = [];

  private attachStream(stream: MediaStream): boolean {
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      stream.getTracks().forEach((t) => t.stop());
      return false;
    }
    this.stream = stream;
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioCtx.createMediaStreamSource(new MediaStream(audioTracks));
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.78;
    source.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.waveHistory = [];
    this.isActive = true;
    audioTracks[0].onended = () => this.stop();
    return true;
  }

  public async start(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      return this.attachStream(stream);
    } catch (err) {
      console.warn('Microphone audio permission denied or unavailable:', err);
      this.stop();
      return false;
    }
  }

  /**
   * Capture browser tab / system playback audio via getDisplayMedia (no microphone required).
   */
  public async startSystemAudio(): Promise<boolean> {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: true,
      });
      // Release unneeded video track while retaining the shared tab/system audio track
      stream.getVideoTracks().forEach((t: MediaStreamTrack) => t.stop());
      if (!this.attachStream(stream)) {
        alert('No audio track was shared. Check "Share tab audio" or "Share system audio" in the dialog.');
        this.stop();
        return false;
      }
      return true;
    } catch (err) {
      console.warn('System/tab audio capture cancelled or unavailable:', err);
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
    this.waveHistory = [];
  }

  public getRunning(): boolean {
    return this.isActive;
  }

  public sampleFrame(
    numLeds: number,
    sensitivity = 1.0,
    t = 0.0,
    style: AudioVisualizerStyle = 'spectrum'
  ): RGB[] {
    const pixels: RGB[] = new Array(numLeds);
    for (let i = 0; i < numLeds; i++) pixels[i] = [0, 0, 0];
    if (!this.isActive || !this.analyser || !this.dataArray) {
      return pixels;
    }

    (this.analyser as any).getByteFrequencyData(this.dataArray);

    // Band energies: bass (0..7), mid (8..31), treble (32..95)
    let bassSum = 0, midSum = 0, trebSum = 0;
    for (let i = 0; i < 8; i++) bassSum += this.dataArray[i];
    for (let i = 8; i < 32; i++) midSum += this.dataArray[i];
    for (let i = 32; i < 96; i++) trebSum += this.dataArray[i];

    const bass = clamp01((bassSum / (8 * 255)) * sensitivity);
    const midE = clamp01((midSum / (24 * 255)) * sensitivity);
    const treb = clamp01((trebSum / (64 * 255)) * sensitivity);
    this.beatLevel = Math.max(bass, this.beatLevel * 0.90);

    const mid = Math.floor(numLeds / 2);

    if (style === 'wave') {
      // Traveling neon wave radiating outward from strip center
      const hue = (0.85 - bass * 0.35 + treb * 0.25 + t * 0.04) % 1.0;
      const energy = clamp01(bass * 0.65 + midE * 0.35 + treb * 0.2);
      const centerColor: RGB = hsvToRgb(hue < 0 ? hue + 1 : hue, 0.95, energy);
      this.waveHistory.unshift(centerColor);
      if (this.waveHistory.length > mid + 1) this.waveHistory.pop();

      for (let i = 0; i < mid; i++) {
        const c = this.waveHistory[i] ?? [0, 0, 0];
        const fade = 1 - (i / Math.max(1, mid)) * 0.45;
        const rgb: RGB = [c[0] * fade, c[1] * fade, c[2] * fade];
        pixels[mid - 1 - i] = rgb;
        if (mid + i < numLeds) pixels[mid + i] = rgb;
      }
      return pixels;
    }

    if (style === 'vu') {
      // Classic mirrored VU meter: emerald -> amber -> magenta peak
      const level = clamp01(this.beatLevel * 0.75 + midE * 0.4);
      const lit = Math.round(level * mid);
      for (let i = 0; i < lit; i++) {
        const frac = i / Math.max(1, mid);
        const col: RGB =
          frac < 0.55 ? [0.05, 0.92, 0.45] :
          frac < 0.82 ? [0.98, 0.72, 0.08] :
                        [0.98, 0.14, 0.42];
        pixels[mid - 1 - i] = col;
        if (mid + i < numLeds) pixels[mid + i] = col;
      }
      return pixels;
    }

    // Default: symmetric dual-sided frequency spectrum
    const binCount = this.analyser.frequencyBinCount;
    for (let i = 0; i < mid; i++) {
      const binIdx = Math.floor((i / mid) * (binCount * 0.75));
      const val = ((this.dataArray[binIdx] || 0) / 255) * sensitivity;
      const hue = (0.75 - (i / mid) * 0.75 + t * 0.05) % 1.0;
      const rgb = hsvToRgb(hue, 0.95, clamp01(val));
      const bassFlash = i < 8 ? this.beatLevel * 0.8 : 0;
      const r = clamp01(rgb[0] + bassFlash);
      const g = clamp01(rgb[1] + bassFlash * 0.2);
      const b = clamp01(rgb[2] + bassFlash * 0.5);
      pixels[mid - 1 - i] = [r, g, b];
      if (mid + i < numLeds) pixels[mid + i] = [r, g, b];
    }
    return pixels;
  }
}
