import { RGB, ConnectionStatus } from '../types';
import { computeMinFrameIntervalMs, encodeAdalightFrame, FrameEncodeOptions } from './protocol';

export class WebSerialDriver {
  private port: any = null;
  private writer: any = null;
  private status: ConnectionStatus = 'disconnected';
  private onStatusChange?: (status: ConnectionStatus, message?: string) => void;
  private isWriting = false;
  private isReady = false;
  private lastSendTime = 0;
  private baudRate = 115200;
  private lastNumLeds = 150;
  private frameBuf: Uint8Array | null = null;
  private consecutiveErrors = 0;
  private readonly handlePortDisconnect = (ev: any) => {
    if (this.port && (!ev?.target || ev.target === this.port)) {
      this.port = null;
      this.writer = null;
      this.isReady = false;
      this.isWriting = false;
      this.updateStatus('disconnected', 'USB strip unplugged');
    }
  };

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
      this.baudRate = baudRate;
      this.consecutiveErrors = 0;
      this.updateStatus('connecting', 'Waiting for port selection...');
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate });
      this.writer = this.port.writable.getWriter();
      (navigator as any).serial.addEventListener?.('disconnect', this.handlePortDisconnect);

      // Wait 1.8s for the Arduino / microcontroller bootloader reset to settle
      this.updateStatus('connecting', 'Synchronizing with controller...');
      await new Promise((r) => setTimeout(r, 1800));
      if (!this.port || !this.writer) {
        return false;
      }
      this.isReady = true;

      this.updateStatus('connected', `Connected @ ${baudRate} baud`);
      return true;
    } catch (err: any) {
      this.updateStatus('error', err?.message || 'Failed to open serial port');
      await this.disconnect();
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    this.isReady = false;
    this.isWriting = false;
    if (this.isSupported()) {
      (navigator as any).serial.removeEventListener?.('disconnect', this.handlePortDisconnect);
    }
    try {
      if (this.writer) {
        try {
          // Send blackout frame matching the active strip length so LEDs do not remain frozen
          const numLeds = Math.max(1, this.lastNumLeds);
          const count = numLeds - 1;
          const blackBuf = new Uint8Array(6 + numLeds * 3);
          blackBuf[0] = 0x41;
          blackBuf[1] = 0x64;
          blackBuf[2] = 0x61;
          blackBuf[3] = (count >> 8) & 0xff;
          blackBuf[4] = count & 0xff;
          blackBuf[5] = ((count >> 8) & 0xff) ^ (count & 0xff) ^ 0x55;
          await this.writer.write(blackBuf);
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
    applyGamma = true,
    extra: Partial<FrameEncodeOptions> = {}
  ): Promise<void> {
    if (!this.writer || this.status !== 'connected' || !this.isReady || this.isWriting) {
      return;
    }

    const numLeds = pixels.length;
    if (numLeds <= 0) {
      return;
    }
    this.lastNumLeds = numLeds;

    // Dynamically pace frames to the serial link capacity (10 bits/byte in 8N1)
    const minIntervalMs = computeMinFrameIntervalMs(numLeds, this.baudRate);
    const now = performance.now();
    if (now - this.lastSendTime < minIntervalMs) {
      return;
    }
    this.lastSendTime = now;

    this.frameBuf = encodeAdalightFrame(
      pixels,
      {
        brightness,
        colorOrder,
        applyGamma,
        whiteBalance: extra.whiteBalance,
        reverse: extra.reverse,
        startOffset: extra.startOffset,
      },
      this.frameBuf
    );
    const buffer = this.frameBuf;

    try {
      this.isWriting = true;
      await this.writer.write(buffer);
      this.consecutiveErrors = 0;
    } catch (err: any) {
      this.consecutiveErrors++;
      console.warn('Serial write dropped frame:', err);
      const isFatal =
        err?.name === 'NetworkError' ||
        err?.name === 'InvalidStateError' ||
        this.consecutiveErrors >= 5;
      if (isFatal) {
        this.isWriting = false;
        await this.disconnect();
        return;
      }
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
