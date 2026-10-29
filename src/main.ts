import './style.css';
import { AppMode, AppSettings, ConnectionStatus, RGB } from './types';
import { WebSerialDriver } from './driver/webSerial';
import { ScreenCaptureDriver } from './driver/screenCapture';
import { AudioReactiveDriver } from './driver/audioReactive';
import { AnimationEngine, SCENE_METADATA } from './engine/engine';
import { VirtualStrip } from './components/VirtualStrip';
import { hexToRgb } from './engine/math';

// App Default Settings
const settings: AppSettings = {
  ledCount: 150,
  brightness: 0.85,
  baudRate: 115200,
  colorOrder: 'RGB',
  applyGamma: true,
  sceneDuration: 24,
  crossfadeDuration: 1.2,
  selectedSceneId: 'nerf_duel',
  activeMode: 'playlist',
  solidColor: '#00e5ff',
  screenCaptureFps: 30,
  audioSensitivity: 1.0,
};

let isPaused = false;
let deferredPrompt: any = null;

// Instantiate drivers & engines
const engine = new AnimationEngine(settings.ledCount);
const serialDriver = new WebSerialDriver(handleSerialStatusChange);
const screenDriver = new ScreenCaptureDriver();
const audioDriver = new AudioReactiveDriver();

// DOM elements
const container = document.getElementById('stripCanvasContainer')!;
const virtualStrip = new VirtualStrip(container);

const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement;
const connectionPill = document.getElementById('connectionPill')!;
const connectionText = document.getElementById('connectionText')!;
const pwaInstallBtn = document.getElementById('pwaInstallBtn') as HTMLButtonElement;

const activeSceneTitle = document.getElementById('activeSceneTitle')!;
const fpsBadge = document.getElementById('fpsBadge')!;
const ledCountBadge = document.getElementById('ledCountBadge')!;
const playlistProgressBar = document.getElementById('playlistProgressBar')!;
const playlistCurrentNum = document.getElementById('playlistCurrentNum')!;
const playPauseBtn = document.getElementById('playPauseBtn')!;
const playPauseIcon = document.getElementById('playPauseIcon')!;
const playPauseText = document.getElementById('playPauseText')!;
const prevSceneBtn = document.getElementById('prevSceneBtn')!;
const nextSceneBtn = document.getElementById('nextSceneBtn')!;

const brightnessInput = document.getElementById('brightnessInput') as HTMLInputElement;
const brightnessValue = document.getElementById('brightnessValue')!;
const ledCountInput = document.getElementById('ledCountInput') as HTMLInputElement;
const colorOrderSelect = document.getElementById('colorOrderSelect') as HTMLSelectElement;
const baudRateSelect = document.getElementById('baudRateSelect') as HTMLSelectElement;
const gammaToggle = document.getElementById('gammaToggle') as HTMLInputElement;

const sceneDurInput = document.getElementById('sceneDurInput') as HTMLInputElement;
const sceneDurValue = document.getElementById('sceneDurValue')!;
const crossfadeInput = document.getElementById('crossfadeInput') as HTMLInputElement;
const crossfadeValue = document.getElementById('crossfadeValue')!;

const solidColorInput = document.getElementById('solidColorInput') as HTMLInputElement;
const solidHexInput = document.getElementById('solidHexInput') as HTMLInputElement;
const moodPresetsGrid = document.getElementById('moodPresetsGrid')!;
const scenesGrid = document.getElementById('scenesGrid')!;

const toggleScreenBtn = document.getElementById('toggleScreenBtn') as HTMLButtonElement;
const toggleAudioBtn = document.getElementById('toggleAudioBtn') as HTMLButtonElement;
const audioSensInput = document.getElementById('audioSensInput') as HTMLInputElement;
const audioSensValue = document.getElementById('audioSensValue')!;

// Curated Mood Presets
const MOOD_PRESETS = [
  { name: 'Warm Amber', hex: '#FFA040' },
  { name: 'Warm White (3000K)', hex: '#FFE0B0' },
  { name: 'Daylight (5000K)', hex: '#F0F8FF' },
  { name: 'Cyberpunk Neon', hex: '#00F0FF' },
  { name: 'Synthwave Magenta', hex: '#FF007F' },
  { name: 'Matrix Terminal', hex: '#00FF66' },
  { name: 'Deep Oceanic', hex: '#0044FF' },
  { name: 'Sunset Peach', hex: '#FF5E36' },
  { name: 'Violet Haze', hex: '#9933FF' },
];

function initUI() {
  // Render Scene Explorer Cards
  renderSceneCards('all');

  // Render Mood Presets
  moodPresetsGrid.innerHTML = MOOD_PRESETS.map(
    (preset) => `
    <button data-hex="${preset.hex}" class="mood-btn p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center space-x-2 text-left cursor-pointer transition-all">
      <span class="w-4 h-4 rounded-full border border-white/20 shadow-sm" style="background-color: ${preset.hex}"></span>
      <span class="text-xs font-medium text-slate-200">${preset.name}</span>
    </button>
  `
  ).join('');

  document.querySelectorAll('.mood-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const hex = (e.currentTarget as HTMLElement).getAttribute('data-hex')!;
      setSolidColor(hex);
    });
  });

  // Mode Tabs Switching
  document.querySelectorAll('.mode-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const mode = (e.currentTarget as HTMLElement).getAttribute('data-mode') as AppMode;
      setMode(mode);
    });
  });

  // Scene Filter Pills
  document.querySelectorAll('.scene-filter').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.scene-filter').forEach((p) => {
        p.classList.remove('bg-cyan-500', 'text-black');
        p.classList.add('bg-white/5', 'text-slate-300');
      });
      const el = e.currentTarget as HTMLElement;
      el.classList.add('bg-cyan-500', 'text-black');
      el.classList.remove('bg-white/5', 'text-slate-300');
      const cat = el.getAttribute('data-cat')!;
      renderSceneCards(cat);
    });
  });

  // Hardware Settings Listeners
  brightnessInput.addEventListener('input', () => {
    settings.brightness = parseInt(brightnessInput.value) / 100;
    brightnessValue.textContent = `${brightnessInput.value}%`;
  });

  ledCountInput.addEventListener('change', () => {
    const count = parseInt(ledCountInput.value) || 150;
    settings.ledCount = count;
    engine.setLedCount(count);
    ledCountBadge.textContent = `${count} LEDs`;
  });

  colorOrderSelect.addEventListener('change', () => {
    settings.colorOrder = colorOrderSelect.value as any;
  });

  baudRateSelect.addEventListener('change', () => {
    settings.baudRate = parseInt(baudRateSelect.value);
  });

  gammaToggle.addEventListener('change', () => {
    settings.applyGamma = gammaToggle.checked;
  });

  // Playlist Controls
  sceneDurInput.addEventListener('input', () => {
    settings.sceneDuration = parseInt(sceneDurInput.value);
    sceneDurValue.textContent = `${settings.sceneDuration} seconds`;
  });

  crossfadeInput.addEventListener('input', () => {
    settings.crossfadeDuration = parseFloat(crossfadeInput.value);
    crossfadeValue.textContent = `${settings.crossfadeDuration} seconds`;
  });

  playPauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    playPauseIcon.textContent = isPaused ? '▶' : '⏸';
    playPauseText.textContent = isPaused ? 'Play' : 'Pause';
  });

  prevSceneBtn.addEventListener('click', () => {
    const curIdx = SCENE_METADATA.findIndex((s) => s.id === settings.selectedSceneId);
    const newIdx = (curIdx - 1 + SCENE_METADATA.length) % SCENE_METADATA.length;
    settings.selectedSceneId = SCENE_METADATA[newIdx].id;
    setMode('scene');
    activeSceneTitle.textContent = SCENE_METADATA[newIdx].name;
    renderSceneCards('all');
  });

  nextSceneBtn.addEventListener('click', () => {
    const curIdx = SCENE_METADATA.findIndex((s) => s.id === settings.selectedSceneId);
    const newIdx = (curIdx + 1) % SCENE_METADATA.length;
    settings.selectedSceneId = SCENE_METADATA[newIdx].id;
    setMode('scene');
    activeSceneTitle.textContent = SCENE_METADATA[newIdx].name;
    renderSceneCards('all');
  });

  // Connect Serial
  connectBtn.addEventListener('click', async () => {
    if (serialDriver.getStatus() === 'connected') {
      await serialDriver.disconnect();
    } else {
      await serialDriver.connect(settings.baudRate);
    }
  });

  // Solid Color Pickers
  solidColorInput.addEventListener('input', () => {
    setSolidColor(solidColorInput.value);
  });
  solidHexInput.addEventListener('change', () => {
    setSolidColor(solidHexInput.value);
  });

  // Screen Capture Toggle
  toggleScreenBtn.addEventListener('click', async () => {
    if (screenDriver.getRunning()) {
      screenDriver.stop();
      toggleScreenBtn.textContent = 'Start Screen Capture';
      toggleScreenBtn.className = toggleScreenBtn.className.replace('bg-red-500', 'bg-cyan-500');
    } else {
      const ok = await screenDriver.start();
      if (ok) {
        toggleScreenBtn.textContent = 'Stop Screen Capture';
        toggleScreenBtn.className = toggleScreenBtn.className.replace('bg-cyan-500', 'bg-red-500');
      }
    }
  });

  // Audio Toggle
  toggleAudioBtn.addEventListener('click', async () => {
    if (audioDriver.getRunning()) {
      audioDriver.stop();
      toggleAudioBtn.textContent = 'Activate Microphone / Audio';
      toggleAudioBtn.className = toggleAudioBtn.className.replace('bg-red-500', 'bg-fuchsia-500');
    } else {
      const ok = await audioDriver.start();
      if (ok) {
        toggleAudioBtn.textContent = 'Stop Audio Visualizer';
        toggleAudioBtn.className = toggleAudioBtn.className.replace('bg-fuchsia-500', 'bg-red-500');
      }
    }
  });

  audioSensInput.addEventListener('input', () => {
    settings.audioSensitivity = parseFloat(audioSensInput.value);
    audioSensValue.textContent = `${settings.audioSensitivity.toFixed(1)}x`;
  });

  // PWA Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaInstallBtn.classList.remove('hidden');
  });

  pwaInstallBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        pwaInstallBtn.classList.add('hidden');
      }
      deferredPrompt = null;
    }
  });
}

function setMode(mode: AppMode) {
  settings.activeMode = mode;
  document.querySelectorAll('.mode-tab').forEach((tab) => {
    const m = tab.getAttribute('data-mode');
    if (m === mode) {
      tab.className = 'mode-tab px-4 py-2 rounded-lg font-medium text-sm transition-all bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 cursor-pointer';
    } else {
      tab.className = 'mode-tab px-4 py-2 rounded-lg font-medium text-sm transition-all text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer';
    }
  });

  // Hide all panels, show active
  document.querySelectorAll('.mode-panel').forEach((panel) => panel.classList.add('hidden'));
  const panelMap: Record<AppMode, string> = {
    playlist: 'panelPlaylist',
    scene: 'panelScene',
    solid: 'panelSolid',
    screen: 'panelScreen',
    audio: 'panelAudio',
  };
  const targetId = panelMap[mode];
  if (targetId) {
    document.getElementById(targetId)?.classList.remove('hidden');
  }

  // Update hero title
  if (mode === 'solid') {
    activeSceneTitle.textContent = `Static Solid Color: ${settings.solidColor.toUpperCase()}`;
  } else if (mode === 'screen') {
    activeSceneTitle.textContent = '🖥️ Screen Edge Ambilight Mirroring';
  } else if (mode === 'audio') {
    activeSceneTitle.textContent = '🎵 Sound & Music Reactive Visualizer';
  }
}

function setSolidColor(hex: string) {
  settings.solidColor = hex;
  solidColorInput.value = hex;
  solidHexInput.value = hex.toUpperCase();
  if (settings.activeMode === 'solid') {
    activeSceneTitle.textContent = `Static Solid Color: ${hex.toUpperCase()}`;
  }
}

function renderSceneCards(category = 'all') {
  const filtered = category === 'all' ? SCENE_METADATA : SCENE_METADATA.filter((s) => s.category === category);

  scenesGrid.innerHTML = filtered
    .map((scene, idx) => {
      const isSelected = settings.selectedSceneId === scene.id;
      return `
      <div data-id="${scene.id}" class="scene-card p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10' : 'bg-black/30 border-white/5 hover:border-white/20'
      }">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-mono text-cyan-400">#${idx + 1} &bull; ${scene.category}</span>
          ${scene.badge ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">${scene.badge}</span>` : ''}
        </div>
        <h4 class="font-bold text-sm text-white mb-1">${scene.name}</h4>
        <p class="text-xs text-slate-400 leading-relaxed">${scene.description}</p>
      </div>
    `;
    })
    .join('');

  document.querySelectorAll('.scene-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id')!;
      settings.selectedSceneId = id;
      setMode('scene');
      const found = SCENE_METADATA.find((s) => s.id === id);
      if (found) {
        activeSceneTitle.textContent = found.name;
      }
      renderSceneCards(category);
    });
  });
}

function handleSerialStatusChange(status: ConnectionStatus, message?: string) {
  if (status === 'connected') {
    connectionPill.className = 'flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800/50';
    connectionPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Connected</span>';
    connectBtn.textContent = 'Disconnect';
    connectBtn.className = 'px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition-all shadow-md active:scale-95 cursor-pointer';
  } else if (status === 'connecting') {
    connectionPill.className = 'flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono bg-amber-950/50 text-amber-400 border border-amber-800/50';
    connectionPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-spin"></span><span>Connecting...</span>';
  } else {
    connectionPill.className = 'flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono bg-red-950/40 text-red-400 border border-red-800/40';
    connectionPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span><span>Disconnected</span>';
    connectBtn.textContent = 'Connect USB Strip';
    connectBtn.className = 'px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer';
    if (message && status === 'error') {
      alert(message);
    }
  }
}

// Main 60 FPS Animation & Hardware Stream Loop
let frameCount = 0;
let lastFpsTime = performance.now();
let lastNow = performance.now();
let simulatedTime = 0;

function animate(now: number) {
  requestAnimationFrame(animate);

  const delta = (now - lastNow) * 0.001;
  lastNow = now;
  if (!isPaused) {
    simulatedTime += delta;
  }
  const t = simulatedTime;

  // FPS Telemetry
  frameCount++;
  if (now - lastFpsTime >= 1000) {
    fpsBadge.textContent = `${frameCount} FPS`;
    frameCount = 0;
    lastFpsTime = now;
  }

  let framePixels: RGB[];

  if (settings.activeMode === 'playlist') {
    const res = engine.renderPlaylist(t, settings.sceneDuration, settings.crossfadeDuration);
    framePixels = res.pixels;
    activeSceneTitle.textContent = res.currentScene.name;

    // Update progress bar
    const totalCycle = SCENE_METADATA.length * settings.sceneDuration;
    const tCycle = t % totalCycle;
    const sceneIdx = Math.floor(tCycle / settings.sceneDuration);
    const sceneProgress = (tCycle % settings.sceneDuration) / settings.sceneDuration;
    playlistProgressBar.style.width = `${sceneProgress * 100}%`;
    playlistCurrentNum.textContent = `Scene ${sceneIdx + 1} of ${SCENE_METADATA.length}`;
  } else if (settings.activeMode === 'scene') {
    framePixels = engine.renderScene(settings.selectedSceneId, t);
  } else if (settings.activeMode === 'solid') {
    const rgb = hexToRgb(settings.solidColor);
    framePixels = new Array(settings.ledCount).fill(rgb);
  } else if (settings.activeMode === 'screen') {
    framePixels = screenDriver.sampleFrame(settings.ledCount);
  } else if (settings.activeMode === 'audio') {
    framePixels = audioDriver.sampleFrame(settings.ledCount, settings.audioSensitivity, t);
  } else {
    framePixels = new Array(settings.ledCount).fill([0, 0, 0]);
  }

  // 1. Render to Virtual Simulator Canvas
  virtualStrip.render(framePixels, settings.brightness);

  // 2. Stream to Physical Hardware via Web Serial API
  if (serialDriver.getStatus() === 'connected') {
    serialDriver.sendFrame(framePixels, settings.brightness, settings.colorOrder, settings.applyGamma);
  }
}

// Initialize & Launch
initUI();
requestAnimationFrame(animate);
