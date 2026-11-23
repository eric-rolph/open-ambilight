export type RGB = [number, number, number]; // 0.0 to 1.0

export type AppMode = 'playlist' | 'scene' | 'solid' | 'screen' | 'audio';

export type AudioVisualizerStyle = 'spectrum' | 'wave' | 'vu';

export type PreviewLayout = 'strip' | 'monitor';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SceneMeta {
  id: string;
  name: string;
  category: 'retro-game' | 'arcade-action' | 'cosmic-physics' | 'ambient-flow';
  defaultDuration: number; // in seconds
  description: string;
  badge?: string;
}

export interface AppSettings {
  ledCount: number;
  brightness: number; // 0.0 to 1.0
  baudRate: number;
  colorOrder: 'RGB' | 'GRB' | 'BGR';
  applyGamma: boolean;
  sceneDuration: number; // default per scene in playlist
  crossfadeDuration: number;
  selectedSceneId: string;
  activeMode: AppMode;
  solidColor: string; // hex
  screenCaptureFps: number;
  screenSmoothing: number; // EMA alpha (0.1 = ultra smooth, 1.0 = raw instant)
  fourSidedMonitor: boolean;
  audioSensitivity: number;
  audioStyle: AudioVisualizerStyle;
  previewLayout: PreviewLayout;
  reverseStrip: boolean;
  startOffset: number;
  whiteBalance: [number, number, number];
}
