export type RGB = [number, number, number]; // 0.0 to 1.0

export type AppMode = 'playlist' | 'scene' | 'solid' | 'screen' | 'audio';

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
  audioSensitivity: number;
}
