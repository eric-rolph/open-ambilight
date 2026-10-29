import { RGB, ConnectionStatus } from '../types';
import { clamp01, gamma } from '../engine/math';

export class WebSerialDriver {
  private port: any = null;
  private writer: any = null;
  private status: ConnectionStatus = 'disconnected';
  private onStatusChange?: (status: ConnectionStatus, message?: string) => void;
  private isWriting = false;

  constructor(onStatusChange?: (status: ConnectionStatus, message?: string) => void) {
    this.onStatusChange = onStatusChange;
  }

  public isSupported(): boolean {
    return 'serial' in navigator;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public async connect(baudRate = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      this.updateStatus('error', 'Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera on Windows, Linux, Mac, or Android with OTG.');
      return false;
    }

    try {
      this.updateStatus('connecting', 'Waiting for port selection...');
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate });
      this.writer = this.port.writable.getWriter();
      this.updateStatus('connected', `Connected @ ${baudRate} baud`);
      return true;
    } catch (err: any) {
      this.updateStatus('error', err?.message || 'Failed to open serial port');
      this.disconnect();
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        try {
          await this.writer.close();
        } catch {
          // ignore stream close errors
        }
        this.writer = null;
      }
      if (this.port) {
        try {
          await this.port.close();
        } catch {
          // ignore port close errors
        }
        this.port = null;
      }
    } finally {
      this.updateStatus('disconnected', 'Disconnected');
    }
  }

  public async sendFrame(
    pixels: RGB[],
    brightness: number,
    colorOrder: 'RGB' | 'GRB' | 'BGR' = 'RGB',
    applyGamma = true
  ): Promise<void> {
    if (!this.writer || this.status !== 'connected' || this.isWriting) {
      return;
    }

    const numLeds = pixels.length;
    const count = numLeds - 1;
    const hi = (count >> 8) & 0xff;
    const lo = count & 0xff;
    const chk = hi ^ lo ^ 0x55;

    // Buffer: 6-byte header + 3 bytes per LED
    const totalBytes = 6 + numLeds * 3;
    const buffer = new Uint8Array(totalBytes);
    buffer[0] = 0x41; // 'A'
    buffer[1] = 0x64; // 'd'
    buffer[2] = 0x61; // 'a'
    buffer[3] = hi;
    buffer[4] = lo;
    buffer[5] = chk;

    let offset = 6;
    for (let i = 0; i < numLeds; i++) {
      let r = pixels[i][0] * brightness;
      let g = pixels[i][1] * brightness;
      let b = pixels[i][2] * brightness;

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

    try {
      this.isWriting = true;
      await this.writer.write(buffer);
    } catch (err: any) {
      console.warn('Serial write dropped frame:', err);
    } finally {
      this.isWriting = false;
    }
  }

  private updateStatus(status: ConnectionStatus, message?: string) {
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status, message);
    }
  }
}
