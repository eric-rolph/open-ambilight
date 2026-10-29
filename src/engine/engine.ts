import { RGB, SceneMeta } from '../types';
import { clamp01, hsvToRgb, blendFrames } from './math';

export const SCENE_METADATA: SceneMeta[] = [
  {
    id: 'nerf_duel',
    name: 'Nerf Dart Dueling Blasters',
    category: 'arcade-action',
    defaultDuration: 26,
    description: 'Opposite-end high-speed Nerf blaster duels with authentic blue foam, scarlet tips, and kinetic collision explosions.',
    badge: 'Popular',
  },
  {
    id: 'mario',
    name: 'Super Mario Bros.',
    category: 'retro-game',
    defaultDuration: 26,
    description: 'Mario hits the pulsing Question block, catches the bouncing Starman, and sprints invincible to the castle flagpole!',
    badge: 'Retro',
  },
  {
    id: 'sonic',
    name: 'Sonic the Hedgehog',
    category: 'retro-game',
    defaultDuration: 25,
    description: 'Sonic revs his Spin Dash with friction sparks, scoops up spinning golden rings, and slams the red spring bumper!',
    badge: 'Retro',
  },
  {
    id: 'pacman',
    name: '1D Pac-Man Arcade Chase',
    category: 'retro-game',
    defaultDuration: 24,
    description: 'Yellow Pac-Man chomping dots while pursued by ghosts; eats a flashing Power Pellet and turns to hunt!',
    badge: 'Classic',
  },
  {
    id: 'frogger',
    name: 'Frogger: Highway & River',
    category: 'retro-game',
    defaultDuration: 25,
    description: 'Lime green frog hops rhythmically through rushing highway traffic, navigates river logs, and reaches the victory lilypad.',
    badge: 'Retro',
  },
  {
    id: 'breakout',
    name: '1D Breakout Brick-Smasher',
    category: 'arcade-action',
    defaultDuration: 24,
    description: 'Arkanoid brick smasher with reflective paddle tracking and shattering rainbow brick particle explosions.',
    badge: 'Arcade',
  },
  {
    id: 'beam_clash',
    name: 'Dragon vs. Phoenix Beam Clash',
    category: 'arcade-action',
    defaultDuration: 22,
    description: 'Azure dragon breath meets crimson phoenix plasma in an intense, crackling energy tug-of-war struggle.',
    badge: 'Action',
  },
  {
    id: 'dogfight',
    name: 'Spaceship Laser Dogfight',
    category: 'arcade-action',
    defaultDuration: 26,
    description: 'Micro tactical dogfight with dynamic evasive maneuvers, red laser bursts, shield impacts, and explosion wreckage.',
    badge: 'Action',
  },
  {
    id: 'snake',
    name: '1D Snake Game Auto-Hunter',
    category: 'retro-game',
    defaultDuration: 24,
    description: 'Autonomous green/rainbow snake hunting pulsing red apples and growing longer with each feast.',
    badge: 'Arcade',
  },
  {
    id: 'black_hole',
    name: 'Black Hole Accretion Disk',
    category: 'cosmic-physics',
    defaultDuration: 22,
    description: 'Gravitational matter spiral into a dark event horizon with explosive relativistic quasar plasma jets.',
    badge: 'Physics',
  },
  {
    id: 'hadron_collider',
    name: 'Large Hadron Collider',
    category: 'cosmic-physics',
    defaultDuration: 24,
    description: 'Counter-rotating relativistic proton beams accelerating before colliding in a brilliant subatomic quark shower.',
    badge: 'Physics',
  },
  {
    id: 'rainbow_sort',
    name: 'Rainbow Quicksort Visualizer',
    category: 'cosmic-physics',
    defaultDuration: 22,
    description: 'Live randomized color spectrum sorted using animated pivot comparisons until flashing into pure harmony.',
    badge: 'Math',
  },
  {
    id: 'wormhole',
    name: 'Wormhole Portal Teleportation',
    category: 'cosmic-physics',
    defaultDuration: 22,
    description: 'Aperture-style blue and orange portals with high-velocity light packets teleporting across space.',
    badge: 'Physics',
  },
  {
    id: 'fireworks',
    name: 'Firework Mortar Shells',
    category: 'ambient-flow',
    defaultDuration: 22,
    description: 'Gravity-curved mortar launches bursting at their apex into glittering cascading crackle shells.',
    badge: 'Show',
  },
  {
    id: 'billiards',
    name: 'Elastic Rainbow Billiards',
    category: 'cosmic-physics',
    defaultDuration: 22,
    description: 'Newtonian elastic collisions with physical mass and momentum transfer across colored spheres.',
    badge: 'Physics',
  },
  {
    id: 'lava_lamp',
    name: 'Thermal Lava Lamp Metaballs',
    category: 'ambient-flow',
    defaultDuration: 20,
    description: 'Organic thermal fluid blobs floating, colliding, and merging with fluid surface tension.',
    badge: 'Ambient',
  },
  {
    id: 'aurora',
    name: 'Hyper-Breathing Aurora',
    category: 'ambient-flow',
    defaultDuration: 18,
    description: 'Breathing multi-phase northern lights with gentle stellar sparkles and deep harmonic undulations.',
    badge: 'Chill',
  },
  {
    id: 'supernova',
    name: 'Supernova Neon Shockwaves',
    category: 'cosmic-physics',
    defaultDuration: 18,
    description: 'Stellar core collapse detonating violent expanding neon shockwaves across the dark void.',
    badge: 'Cosmic',
  },
  {
    id: 'dueling_comets',
    name: 'Dueling Laser Comets',
    category: 'ambient-flow',
    defaultDuration: 18,
    description: 'Twin high-speed laser comets with long chromatic ion tails sweeping across the strip.',
    badge: 'Flow',
  },
  {
    id: 'kitt_scanner',
    name: 'Rainbow KITT Scanner',
    category: 'arcade-action',
    defaultDuration: 18,
    description: 'Knight Rider style cyclon scanner with rainbow chromatic trails and turnaround afterburner flares.',
    badge: 'Retro',
  },
  {
    id: 'dna_weave',
    name: 'Double-Helix DNA Weave',
    category: 'ambient-flow',
    defaultDuration: 18,
    description: 'Two counter-scrolling intertwining wave ribbons simulating a rotating 3D DNA macromolecule.',
    badge: 'Bio',
  },
  {
    id: 'lightning_storm',
    name: 'Electric Lightning Storm',
    category: 'ambient-flow',
    defaultDuration: 18,
    description: 'High-voltage electric discharges with jagged leader strokes, thunder strobes, and fading ion afterglow.',
    badge: 'Energy',
  },
  {
    id: 'warp_drive',
    name: 'Warp-Drive Hyper-Chase',
    category: 'cosmic-physics',
    defaultDuration: 18,
    description: 'Relativistic starfield accelerating toward hyper-speed light warp with blue-shifted Doppler compression.',
    badge: 'Cosmic',
  },
];

// Color definitions
const NERF_BLUE = [0.0, 0.02, 1.0] as RGB;
const NERF_RED = [1.0, 0.04, 0.0] as RGB;

export class AnimationEngine {
  public numLeds: number;
  private lastT = 0;

  // Nerf state
  private nerfState = 'charging';
  private nerfStateStart = 0;
  private nerfChargeDur = 0.6;
  private nerfCooldownDur = 1.4;
  private dart1Pos = 4;
  private dart1Speed = 80;
  private dart2Pos = 145;
  private dart2Speed = 80;
  private nerfSparks: Array<[number, number, number, number, number, number, number, number, number]> = [];
  private nerfShockwaves: Array<[number, number, number, number, number, number]> = [];

  // Mario state
  private marioState = 'approach';
  private marioStateStart = 0;
  private marioPos = 4;
  private marioVel = 22;
  private blockHit = false;
  private starActive = false;
  private starPos = 38;
  private starVel = 0;
  private marioSparks: Array<[number, number, number, number, number, number, number, number]> = [];
  private marioEnemies = [
    { pos: 65, type: 'goomba', alive: true },
    { pos: 90, type: 'koopa', alive: true },
    { pos: 115, type: 'goomba', alive: true },
  ];

  // Sonic state
  private sonicState = 'spindash';
  private sonicStateStart = 0;
  private sonicPos = 6;
  private sonicVel = 0;
  private sonicDir = 1;
  private sonicRings: Array<{ pos: number; collected: boolean; flash: number }> = [];
  private sonicSparks: Array<[number, number, number, number, number, number, number, number]> = [];
  private sonicBadnikAlive = true;

  // Pacman state
  private pacPos = 10;
  private pacDir = 1;
  private pacPowered = false;
  private pacPowerTimer = 0;
  private pacDots: boolean[] = [];

  // Frogger state
  private frogPos = 4;
  private frogTarget = 4;
  private frogHopTimer = 0;
  private frogCars: Array<{ pos: number; speed: number; len: number; color: RGB }> = [];
  private frogLogs: Array<{ pos: number; speed: number; len: number }> = [];

  // Breakout state
  private ballPos = 6;
  private ballVel = 46;
  private paddlePos = 2;
  private bricks: number[] = [];

  constructor(numLeds = 150) {
    this.numLeds = numLeds;
    this.initSimulations();
  }

  public setLedCount(count: number) {
    this.numLeds = Math.max(20, Math.min(600, count));
    this.initSimulations();
  }

  private initSimulations() {
    this.resetNerf(0);
    this.resetMario(0);
    this.resetSonic(0);
    this.resetPacman();
    this.resetFrogger(0);
    this.resetBreakout();
  }

  private resetNerf(t: number) {
    this.nerfState = 'charging';
    this.nerfStateStart = t;
    this.nerfChargeDur = 0.5 + Math.random() * 0.3;
    const r1 = Math.random();
    this.dart1Speed = r1 < 0.3 ? 42 + Math.random() * 15 : r1 < 0.7 ? 80 + Math.random() * 25 : 130 + Math.random() * 30;
    const r2 = Math.random();
    this.dart2Speed = r2 < 0.3 ? 42 + Math.random() * 15 : r2 < 0.7 ? 80 + Math.random() * 25 : 130 + Math.random() * 30;
    this.dart1Pos = 4;
    this.dart2Pos = this.numLeds - 5;
  }

  private resetMario(t: number) {
    this.marioState = 'approach';
    this.marioStateStart = t;
    this.marioPos = 2;
    this.marioVel = 22;
    this.blockHit = false;
    this.starActive = false;
    this.marioEnemies.forEach((e) => (e.alive = true));
  }

  private resetSonic(t: number) {
    this.sonicState = 'spindash';
    this.sonicStateStart = t;
    this.sonicPos = 6;
    this.sonicVel = 0;
    this.sonicDir = 1;
    this.sonicBadnikAlive = true;
    this.sonicRings = [];
    for (let p = 25; p < this.numLeds - 25; p += 12) {
      this.sonicRings.push({ pos: p, collected: false, flash: 0 });
    }
  }

  private resetPacman() {
    this.pacPos = 12;
    this.pacDir = 1;
    this.pacPowered = false;
    this.pacPowerTimer = 0;
    this.pacDots = new Array(this.numLeds).fill(false);
    for (let i = 10; i < this.numLeds - 10; i += 4) {
      this.pacDots[i] = true;
    }
  }

  private resetFrogger(t: number) {
    this.frogPos = 4;
    this.frogTarget = 4;
    this.frogHopTimer = 0;
    this.frogCars = [
      { pos: 16, speed: 28, len: 2, color: [1.0, 0.85, 0.0] },
      { pos: 42, speed: 28, len: 2, color: [1.0, 0.85, 0.0] },
      { pos: 58, speed: -36, len: 2, color: [1.0, 0.04, 0.0] },
      { pos: 30, speed: -36, len: 2, color: [1.0, 0.04, 0.0] },
      { pos: 22, speed: 20, len: 3, color: [0.95, 0.95, 0.95] },
    ];
    this.frogLogs = [
      { pos: 80, speed: 14, len: 4 },
      { pos: 112, speed: 14, len: 4 },
      { pos: 130, speed: -18, len: 3 },
      { pos: 95, speed: -18, len: 3 },
    ];
  }

  private resetBreakout() {
    this.bricks = [];
    for (let i = 32; i < Math.min(50, this.numLeds); i += 2) {
      this.bricks.push(i);
    }
    this.ballPos = 6;
    this.ballVel = 44;
  }

  public renderScene(sceneId: string, t: number): RGB[] {
    const dt = this.lastT === 0 ? 0.016 : Math.min(0.1, Math.max(0.001, t - this.lastT));
    this.lastT = t;

    switch (sceneId) {
      case 'nerf_duel': return this.renderNerfDuel(t, dt);
      case 'mario': return this.renderMario(t, dt);
      case 'sonic': return this.renderSonic(t, dt);
      case 'pacman': return this.renderPacman(t, dt);
      case 'frogger': return this.renderFrogger(t, dt);
      case 'breakout': return this.renderBreakout(t, dt);
      case 'beam_clash': return this.renderBeamClash(t);
      case 'dogfight': return this.renderDogfight(t, dt);
      case 'snake': return this.renderSnake(t);
      case 'black_hole': return this.renderBlackHole(t);
      case 'hadron_collider': return this.renderHadronCollider(t);
      case 'rainbow_sort': return this.renderRainbowSort(t);
      case 'wormhole': return this.renderWormhole(t);
      case 'fireworks': return this.renderFireworks(t);
      case 'billiards': return this.renderBilliards(t);
      case 'lava_lamp': return this.renderLavaLamp(t);
      case 'aurora': return this.renderAurora(t);
      case 'supernova': return this.renderSupernova(t);
      case 'dueling_comets': return this.renderDuelingComets(t);
      case 'kitt_scanner': return this.renderKittScanner(t);
      case 'dna_weave': return this.renderDnaWeave(t);
      case 'lightning_storm': return this.renderLightningStorm(t);
      case 'warp_drive': return this.renderWarpDrive(t);
      default: return this.renderNerfDuel(t, dt);
    }
  }

  // --- 1. Nerf Dart Dueling Blasters ---
  private renderNerfDuel(t: number, dt: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);

    if (this.nerfState === 'charging') {
      if (t - this.nerfStateStart >= this.nerfChargeDur) {
        this.nerfState = 'flying';
      }
    } else if (this.nerfState === 'cooldown') {
      if (t - this.nerfStateStart >= this.nerfCooldownDur) {
        this.resetNerf(t);
      }
    }

    // Blaster ends
    const blPulse = 0.75 + 0.25 * Math.sin(t * 14.0);
    pixels[0] = [NERF_BLUE[0] * blPulse, NERF_BLUE[1] * blPulse, NERF_BLUE[2] * blPulse];
    pixels[1] = [0.8, 0.8, 0.8];
    pixels[n - 1] = [NERF_BLUE[0] * blPulse, NERF_BLUE[1] * blPulse, NERF_BLUE[2] * blPulse];
    pixels[n - 2] = [0.8, 0.8, 0.8];

    if (this.nerfState === 'flying') {
      this.dart1Pos += this.dart1Speed * dt;
      this.dart2Pos -= this.dart2Speed * dt;

      if (this.dart1Pos >= this.dart2Pos) {
        this.nerfState = 'cooldown';
        this.nerfStateStart = t;
        const impact = 0.5 * (this.dart1Pos + this.dart2Pos);

        // Shockwave
        this.nerfShockwaves.push([impact, 0, 15, 1.0, 160, 0.88]);

        // Sparks
        for (let i = 0; i < 30; i++) {
          const speed = (Math.random() * 2 - 1) * (50 + Math.random() * 70);
          const isRed = Math.random() < 0.45;
          const color = isRed ? NERF_RED : NERF_BLUE;
          this.nerfSparks.push([
            impact,
            speed,
            color[0],
            color[1],
            color[2],
            1.0,
            0.915,
            0.962,
            Math.random() * 6.28,
          ]);
        }
      }

      // Draw darts
      const tip1 = Math.round(this.dart1Pos);
      if (tip1 < n - 4) {
        if (tip1 >= 0 && tip1 < n) pixels[tip1] = [1.0, 0.08, 0.02];
        if (tip1 - 1 >= 0) pixels[tip1 - 1] = NERF_BLUE;
        if (tip1 - 2 >= 0) pixels[tip1 - 2] = NERF_BLUE;
        if (tip1 - 3 >= 0) pixels[tip1 - 3] = [0, 0, 0.65];
      }

      const tip2 = Math.round(this.dart2Pos);
      if (tip2 >= 4) {
        if (tip2 < n) pixels[tip2] = [1.0, 0.08, 0.02];
        if (tip2 + 1 < n) pixels[tip2 + 1] = NERF_BLUE;
        if (tip2 + 2 < n) pixels[tip2 + 2] = NERF_BLUE;
        if (tip2 + 3 < n) pixels[tip2 + 3] = [0, 0, 0.65];
      }
    }

    // Shockwaves
    this.nerfShockwaves = this.nerfShockwaves.filter((sw) => {
      let [center, r, maxR, intensity, spd, dec] = sw;
      r += spd * dt;
      intensity *= dec;
      if (intensity > 0.03 && r < maxR) {
        const ri = Math.round(r);
        [-1, 1].forEach((dir) => {
          const idx = Math.round(center + dir * ri);
          if (idx >= 0 && idx < n) {
            pixels[idx][0] = Math.min(1.0, pixels[idx][0] + intensity * 1.0);
            pixels[idx][1] = Math.min(1.0, pixels[idx][1] + intensity * 0.18);
            pixels[idx][2] = Math.min(1.0, pixels[idx][2] + intensity * 0.08);
          }
        });
        sw[1] = r;
        sw[3] = intensity;
        return true;
      }
      return false;
    });

    // Sparks
    this.nerfSparks = this.nerfSparks.filter((sp) => {
      let [pos, vel, sr, sg, sb, life, drag, dec, phase] = sp;
      pos += vel * dt;
      vel *= drag;
      life *= dec;
      if (life > 0.03 && pos >= 0 && pos < n) {
        const idx = Math.round(pos);
        const tw = 0.82 + 0.18 * Math.sin(t * 18.0 + phase);
        const el = life * tw;
        pixels[idx][0] = Math.min(1.0, pixels[idx][0] + sr * el);
        pixels[idx][1] = Math.min(1.0, pixels[idx][1] + sg * el);
        pixels[idx][2] = Math.min(1.0, pixels[idx][2] + sb * el);
        sp[0] = pos;
        sp[1] = vel;
        sp[5] = life;
        return true;
      }
      return false;
    });

    return pixels;
  }

  // --- 2. Super Mario Bros. ---
  private renderMario(t: number, dt: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);

    if (this.marioState === 'approach') {
      this.marioPos += this.marioVel * dt;
      if (this.marioPos >= 36 && !this.blockHit) {
        this.blockHit = true;
        this.starActive = true;
        this.starPos = 40;
        this.starVel = 32;
        this.marioState = 'star_bounce';
      }
    } else if (this.marioState === 'star_bounce') {
      this.marioPos += this.marioVel * 1.3 * dt;
      this.starPos += this.starVel * dt;
      if (this.marioPos >= this.starPos) {
        this.marioState = 'starman';
        this.starActive = false;
        this.marioVel = 75;
      }
    } else if (this.marioState === 'starman') {
      this.marioPos += this.marioVel * dt;
      this.marioEnemies.forEach((e) => {
        if (e.alive && Math.abs(this.marioPos - e.pos) < 3.5) {
          e.alive = false;
          for (let i = 0; i < 14; i++) {
            this.marioSparks.push([
              e.pos,
              (Math.random() * 2 - 1) * 35,
              1.0,
              0.9,
              0.2,
              1.0,
              0.88,
              0.9,
            ]);
          }
        }
      });
      if (this.marioPos >= n - 10) {
        this.marioState = 'castle';
        this.marioStateStart = t;
      }
    } else if (this.marioState === 'castle') {
      if (t - this.marioStateStart >= 2.5) {
        this.resetMario(t);
      }
    }

    // Question block
    const bp = 38;
    if (!this.blockHit) {
      const qp = 0.75 + 0.25 * Math.sin(t * 8);
      pixels[bp] = [1.0 * qp, 0.72 * qp, 0.04 * qp];
    } else {
      pixels[bp] = [0.28, 0.14, 0.04];
    }

    // Flagpole
    for (let i = n - 8; i < n - 4; i++) {
      if (i >= 0 && i < n) pixels[i] = [0.15, 0.8, 0.2];
    }

    // Enemies
    this.marioEnemies.forEach((e) => {
      if (e.alive && e.pos < n) {
        pixels[Math.round(e.pos)] = e.type === 'goomba' ? [0.6, 0.22, 0.04] : [0.05, 0.85, 0.12];
      }
    });

    // Star
    if (this.starActive && this.starPos < n) {
      pixels[Math.round(this.starPos)] = [1.0, 0.95, 0.1];
    }

    // Mario
    const mp = Math.round(this.marioPos);
    if (mp >= 0 && mp < n) {
      if (this.marioState === 'starman') {
        const hue = (t * 6.0) % 1.0;
        const starColor = hsvToRgb(hue, 0.9, 1.0);
        pixels[mp] = starColor;
        if (mp - 1 >= 0) pixels[mp - 1] = starColor;
        if (mp - 2 >= 0) pixels[mp - 2] = [starColor[0] * 0.5, starColor[1] * 0.5, starColor[2] * 0.5];
      } else {
        pixels[mp] = [1.0, 0.04, 0.0];
        if (mp - 1 >= 0) pixels[mp - 1] = [0.0, 0.05, 1.0];
      }
    }

    // Sparks
    this.marioSparks = this.marioSparks.filter((sp) => {
      let [pos, vel, sr, sg, sb, life, drag, dec] = sp;
      pos += vel * dt;
      vel *= drag;
      life *= dec;
      if (life > 0.04 && pos >= 0 && pos < n) {
        const idx = Math.round(pos);
        pixels[idx][0] = Math.min(1.0, pixels[idx][0] + sr * life);
        pixels[idx][1] = Math.min(1.0, pixels[idx][1] + sg * life);
        pixels[idx][2] = Math.min(1.0, pixels[idx][2] + sb * life);
        sp[0] = pos;
        sp[1] = vel;
        sp[5] = life;
        return true;
      }
      return false;
    });

    return pixels;
  }

  // --- 3. Sonic the Hedgehog ---
  private renderSonic(t: number, dt: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);

    if (this.sonicState === 'spindash') {
      if (t - this.sonicStateStart >= 0.85) {
        this.sonicState = 'launch';
        this.sonicVel = 145;
      }
    } else if (this.sonicState === 'launch') {
      this.sonicPos += this.sonicVel * dt * this.sonicDir;
      this.sonicRings.forEach((r) => {
        if (!r.collected && Math.abs(this.sonicPos - r.pos) < 3.0) {
          r.collected = true;
          r.flash = 1.0;
        }
      });
      if (this.sonicPos >= n - 8) {
        this.sonicPos = n - 8;
        this.sonicState = 'bounce';
        this.sonicDir = -1;
        this.sonicVel = 115;
      }
    } else if (this.sonicState === 'bounce') {
      this.sonicPos += this.sonicVel * dt * this.sonicDir;
      if (this.sonicBadnikAlive && Math.abs(this.sonicPos - 78) < 3.0) {
        this.sonicBadnikAlive = false;
        for (let i = 0; i < 20; i++) {
          this.sonicSparks.push([78, (Math.random() * 2 - 1) * 35, 1.0, 0.75, 0.0, 1.0, 0.92, 0.94]);
        }
      }
      if (this.sonicPos <= 6) {
        this.resetSonic(t);
      }
    }

    // Spring pad
    if (n - 6 < n) {
      pixels[n - 6] = [1.0, 0.02, 0.02];
      pixels[n - 5] = [1.0, 0.8, 0.0];
    }

    // Rings
    this.sonicRings.forEach((r) => {
      const idx = Math.round(r.pos);
      if (idx < n) {
        if (!r.collected) {
          const rp = 0.75 + 0.25 * Math.sin(t * 12 + r.pos);
          pixels[idx] = [1.0 * rp, 0.8 * rp, 0.0];
        } else if (r.flash > 0.05) {
          pixels[idx] = [r.flash, r.flash * 0.95, r.flash * 0.4];
          r.flash *= 0.75;
        }
      }
    });

    // Badnik
    if (this.sonicBadnikAlive && 78 < n) {
      pixels[78] = [0.65, 0.05, 0.75];
      pixels[77] = [1.0, 0.0, 0.0];
    }

    // Sonic
    const sp = Math.round(this.sonicPos);
    for (let off = 0; off < 4; off++) {
      const idx = sp - off * this.sonicDir;
      if (idx >= 0 && idx < n) {
        if (off === 0) pixels[idx] = [0.0, 0.12, 1.0];
        else if (off === 1) pixels[idx] = [1.0, 0.02, 0.0];
        else {
          const f = (4 - off) / 4;
          pixels[idx] = [0.0, 0.08 * f, 0.8 * f];
        }
      }
    }

    return pixels;
  }

  // --- 4. 1D Pac-Man Arcade Chase ---
  private renderPacman(t: number, dt: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);

    this.pacPos += (this.pacPowered ? 35 : 24) * this.pacDir * dt;
    if (this.pacPos > n - 12) {
      this.pacDir = -1;
      this.pacPowered = true;
      this.pacPowerTimer = 4.0;
    } else if (this.pacPos < 10) {
      this.pacDir = 1;
      this.pacPowered = false;
    }

    if (this.pacPowered) {
      this.pacPowerTimer -= dt;
      if (this.pacPowerTimer <= 0) this.pacPowered = false;
    }

    // Draw dots
    for (let i = 0; i < n; i++) {
      if (this.pacDots[i]) {
        pixels[i] = [0.25, 0.2, 0.1];
      }
    }
    const pp = Math.round(this.pacPos);
    if (pp >= 0 && pp < n) this.pacDots[pp] = false;

    // Power pellets at ends
    const pw1 = 0.6 + 0.4 * Math.sin(t * 10);
    pixels[8] = [pw1, pw1, pw1];
    pixels[n - 9] = [pw1, pw1, pw1];

    // Pacman
    if (pp >= 0 && pp < n) {
      pixels[pp] = [1.0, 0.95, 0.0];
    }

    // Ghosts
    const ghostDist = 12;
    const gPos = this.pacDir > 0 ? this.pacPos - ghostDist : this.pacPos + ghostDist;
    const gp = Math.round(gPos);
    if (gp >= 0 && gp < n) {
      if (this.pacPowered) {
        const flash = Math.sin(t * 16) > 0;
        pixels[gp] = flash ? [0.1, 0.2, 1.0] : [0.8, 0.8, 1.0];
      } else {
        pixels[gp] = [1.0, 0.05, 0.05]; // Blinky
      }
    }

    return pixels;
  }

  // --- 5. Frogger ---
  private renderFrogger(t: number, dt: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);

    this.frogCars.forEach((c) => {
      c.pos += c.speed * dt;
      if (c.speed > 0 && c.pos > 64) c.pos = 12;
      else if (c.speed < 0 && c.pos < 12) c.pos = 64;
      const cp = Math.round(c.pos);
      for (let l = 0; l < c.len; l++) {
        if (cp + l >= 0 && cp + l < n) pixels[cp + l] = c.color;
      }
    });

    this.frogLogs.forEach((l) => {
      l.pos += l.speed * dt;
      if (l.speed > 0 && l.pos > 136) l.pos = 72;
      else if (l.speed < 0 && l.pos < 72) l.pos = 136;
      const lp = Math.round(l.pos);
      for (let k = 0; k < l.len; k++) {
        if (lp + k >= 0 && lp + k < n) pixels[lp + k] = [0.5, 0.2, 0.04];
      }
    });

    // Grass
    for (let i = 0; i < 9; i++) pixels[i] = [0.03, 0.25, 0.05];
    for (let i = 66; i < 72; i++) if (i < n) pixels[i] = [0.03, 0.25, 0.05];

    // Goal
    for (let i = n - 8; i < n; i++) pixels[i] = [1.0, 0.8, 0.1];

    // Frog
    this.frogHopTimer += dt;
    if (this.frogHopTimer > 0.4) {
      this.frogHopTimer = 0;
      this.frogTarget += 5;
      if (this.frogTarget >= n - 8) {
        this.frogTarget = 4;
        this.frogPos = 4;
      }
    }
    this.frogPos += (this.frogTarget - this.frogPos) * Math.min(1.0, 15 * dt);
    const fp = Math.round(this.frogPos);
    if (fp >= 0 && fp < n) pixels[fp] = [0.05, 1.0, 0.02];

    return pixels;
  }

  // --- 6. Breakout Brick-Smasher ---
  private renderBreakout(_t: number, dt: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);

    this.ballPos += this.ballVel * dt;
    if (this.ballPos <= this.paddlePos + 1) {
      this.ballPos = this.paddlePos + 1;
      this.ballVel = Math.abs(this.ballVel);
    } else if (this.ballPos >= n - 2) {
      this.ballVel = -Math.abs(this.ballVel);
    }

    const bi = Math.round(this.ballPos);
    const hitIdx = this.bricks.indexOf(bi);
    if (hitIdx !== -1) {
      this.bricks.splice(hitIdx, 1);
      this.ballVel = -this.ballVel;
      if (this.bricks.length === 0) this.resetBreakout();
    }

    // Paddle
    const pp = Math.round(this.paddlePos);
    if (pp < n) pixels[pp] = [0.2, 0.8, 1.0];
    if (pp + 1 < n) pixels[pp + 1] = [0.2, 0.8, 1.0];

    // Bricks
    this.bricks.forEach((b) => {
      if (b < n) {
        const hue = (b / 50) % 1.0;
        pixels[b] = hsvToRgb(hue, 1.0, 0.85);
      }
    });

    // Ball
    if (bi >= 0 && bi < n) pixels[bi] = [1.0, 1.0, 1.0];

    return pixels;
  }

  // --- 7. Dragon vs Phoenix Beam Clash ---
  private renderBeamClash(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const clash = n * 0.5 + Math.sin(t * 3.5) * (n * 0.22) + Math.sin(t * 9.0) * (n * 0.08);

    for (let i = 0; i < n; i++) {
      if (i < clash - 2) {
        pixels[i] = [0.0, 0.4 + 0.3 * Math.sin(t * 12 + i * 0.5), 1.0];
      } else if (i > clash + 2) {
        pixels[i] = [1.0, 0.25 + 0.2 * Math.sin(t * 14 + i * 0.5), 0.0];
      } else {
        const burst = 0.8 + 0.2 * Math.sin(t * 30);
        pixels[i] = [burst, burst, burst];
      }
    }
    return pixels;
  }

  // --- 8. Spaceship Dogfight ---
  private renderDogfight(t: number, _dt: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const s1 = (Math.sin(t * 2.2) * 0.5 + 0.5) * (n * 0.4) + 6;
    const s2 = n - 6 - (Math.sin(t * 2.5 + 1) * 0.5 + 0.5) * (n * 0.4);

    const i1 = Math.round(s1);
    const i2 = Math.round(s2);
    if (i1 < n) pixels[i1] = [0.1, 0.8, 1.0];
    if (i2 < n) pixels[i2] = [1.0, 0.2, 0.1];

    const laserPhase = (t * 8) % 1.0;
    const lPos = Math.round(s1 + (s2 - s1) * laserPhase);
    if (lPos >= 0 && lPos < n) pixels[lPos] = [1.0, 0.9, 0.1];

    return pixels;
  }

  // --- 9. Snake Arcade ---
  private renderSnake(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const head = Math.floor(((t * 14) % (n * 2)));
    const actualHead = head >= n ? n * 2 - 1 - head : head;

    for (let i = 0; i < 7; i++) {
      const idx = actualHead - i;
      if (idx >= 0 && idx < n) {
        pixels[idx] = i === 0 ? [1.0, 1.0, 0.2] : [0.0, 0.8 - i * 0.1, 0.1];
      }
    }
    const apple = Math.floor(n * 0.72);
    const apPulse = 0.6 + 0.4 * Math.sin(t * 10);
    pixels[apple] = [apPulse, 0.05, 0.05];

    return pixels;
  }

  // --- 10. Black Hole Accretion Disk ---
  private renderBlackHole(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const center = Math.floor(n / 2);

    for (let i = 0; i < n; i++) {
      const d = Math.abs(i - center);
      if (d <= 3) {
        pixels[i] = [0, 0, 0];
      } else {
        const speed = 25.0 / (d + 1);
        const wave = 0.5 + 0.5 * Math.sin(t * speed - d * 0.8);
        const hue = (0.75 + (d / n) * 0.5 + t * 0.1) % 1.0;
        pixels[i] = hsvToRgb(hue, 0.95, wave);
      }
    }
    return pixels;
  }

  // --- 11. Large Hadron Collider ---
  private renderHadronCollider(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const p1 = Math.round((t * 90) % n);
    const p2 = Math.round((n - 1 - ((t * 90) % n)));

    if (p1 >= 0 && p1 < n) pixels[p1] = [0.2, 0.8, 1.0];
    if (p2 >= 0 && p2 < n) pixels[p2] = [1.0, 0.3, 0.1];

    if (Math.abs(p1 - p2) < 2) {
      for (let k = Math.max(0, p1 - 6); k <= Math.min(n - 1, p1 + 6); k++) {
        pixels[k] = [1.0, 1.0, 1.0];
      }
    }
    return pixels;
  }

  // --- 12. Rainbow Quicksort ---
  private renderRainbowSort(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const scan = Math.floor((t * 18) % n);

    for (let i = 0; i < n; i++) {
      const hue = i / n;
      const v = i === scan ? 1.0 : 0.65;
      pixels[i] = hsvToRgb(hue, 0.95, v);
    }
    return pixels;
  }

  // --- 13. Wormhole Portal ---
  private renderWormhole(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const pBlue = 15;
    const pOrange = n - 16;

    pixels[pBlue] = [0.1, 0.6, 1.0];
    pixels[pOrange] = [1.0, 0.45, 0.0];

    const pkt = ((t * 28) % (pOrange - pBlue)) + pBlue;
    const ipkt = Math.round(pkt);
    if (ipkt >= 0 && ipkt < n) pixels[ipkt] = [1.0, 1.0, 1.0];

    return pixels;
  }

  // --- 14. Firework Mortars ---
  private renderFireworks(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const cycle = t % 3.0;

    if (cycle < 1.2) {
      const h = Math.round((cycle / 1.2) * (n * 0.7));
      if (h < n) pixels[h] = [1.0, 0.8, 0.2];
    } else {
      const apex = Math.round(n * 0.7);
      const r = Math.round((cycle - 1.2) * 20);
      const dec = clamp01(1.0 - (cycle - 1.2) / 1.8);
      [-r, r].forEach((d) => {
        const idx = apex + d;
        if (idx >= 0 && idx < n) pixels[idx] = [1.0 * dec, 0.2 * dec, 0.8 * dec];
      });
    }
    return pixels;
  }

  // --- 15. Elastic Billiards ---
  private renderBilliards(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const b1 = Math.round((Math.sin(t * 3) * 0.5 + 0.5) * (n - 1));
    const b2 = Math.round((Math.cos(t * 3.5) * 0.5 + 0.5) * (n - 1));

    if (b1 < n) pixels[b1] = [1.0, 0.2, 0.2];
    if (b2 < n) pixels[b2] = [0.2, 1.0, 0.3];
    return pixels;
  }

  // --- 16. Lava Lamp Metaballs ---
  private renderLavaLamp(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const b1 = (Math.sin(t * 1.1) * 0.5 + 0.5) * n;
    const b2 = (Math.cos(t * 1.4) * 0.5 + 0.5) * n;

    for (let i = 0; i < n; i++) {
      const field = 6.0 / (Math.abs(i - b1) + 1.5) + 6.0 / (Math.abs(i - b2) + 1.5);
      const c = clamp01(field);
      pixels[i] = [c, c * 0.3, c * 0.8];
    }
    return pixels;
  }

  // --- 17. Aurora Borealis ---
  private renderAurora(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    for (let i = 0; i < n; i++) {
      const wave = 0.5 + 0.5 * Math.sin(i * 0.08 + t * 1.5) * Math.cos(i * 0.04 - t * 0.8);
      const hue = (0.35 + 0.25 * Math.sin(i * 0.02 + t * 0.4)) % 1.0;
      pixels[i] = hsvToRgb(hue, 0.85, clamp01(wave));
    }
    return pixels;
  }

  // --- 18. Supernova Shockwaves ---
  private renderSupernova(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const r = ((t * 40) % (n * 0.6));
    const center = Math.floor(n / 2);
    const intensity = clamp01(1.0 - r / (n * 0.6));

    const i1 = Math.round(center - r);
    const i2 = Math.round(center + r);
    if (i1 >= 0 && i1 < n) pixels[i1] = [1.0 * intensity, 0.1 * intensity, 0.8 * intensity];
    if (i2 >= 0 && i2 < n) pixels[i2] = [1.0 * intensity, 0.1 * intensity, 0.8 * intensity];
    return pixels;
  }

  // --- 19. Dueling Comets ---
  private renderDuelingComets(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const c1 = Math.round((t * 45) % n);
    const c2 = Math.round((n - 1 - ((t * 50) % n)));

    for (let i = 0; i < 8; i++) {
      const idx1 = c1 - i;
      if (idx1 >= 0 && idx1 < n) pixels[idx1] = [0.2 * (1 - i / 8), 0.7 * (1 - i / 8), 1.0 * (1 - i / 8)];
      const idx2 = c2 + i;
      if (idx2 >= 0 && idx2 < n) pixels[idx2] = [1.0 * (1 - i / 8), 0.3 * (1 - i / 8), 0.1 * (1 - i / 8)];
    }
    return pixels;
  }

  // --- 20. Rainbow KITT Scanner ---
  private renderKittScanner(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const pos = (Math.sin(t * 3.5) * 0.5 + 0.5) * (n - 1);
    const center = Math.round(pos);

    for (let k = -8; k <= 8; k++) {
      const idx = center + k;
      if (idx >= 0 && idx < n) {
        const falloff = Math.max(0, 1 - Math.abs(k) / 8);
        const hue = (t * 0.2 + idx / n) % 1.0;
        pixels[idx] = hsvToRgb(hue, 1.0, falloff * falloff);
      }
    }
    return pixels;
  }

  // --- 21. Double-Helix DNA ---
  private renderDnaWeave(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    for (let i = 0; i < n; i++) {
      const strand1 = Math.sin(i * 0.25 + t * 4);
      const strand2 = Math.sin(i * 0.25 + t * 4 + Math.PI);
      if (Math.abs(strand1) > 0.8) pixels[i] = [0.1, 0.8, 1.0];
      else if (Math.abs(strand2) > 0.8) pixels[i] = [1.0, 0.2, 0.5];
    }
    return pixels;
  }

  // --- 22. Lightning Storm ---
  private renderLightningStorm(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const flash = Math.sin(t * 11) > 0.95;

    if (flash) {
      const root = Math.floor(Math.random() * n);
      for (let i = Math.max(0, root - 10); i <= Math.min(n - 1, root + 10); i++) {
        pixels[i] = [0.9, 0.95, 1.0];
      }
    }
    return pixels;
  }

  // --- 23. Warp Drive ---
  private renderWarpDrive(t: number): RGB[] {
    const n = this.numLeds;
    const pixels: RGB[] = Array.from({ length: n }, () => [0, 0, 0]);
    const speed = 60.0;
    for (let i = 0; i < n; i += 6) {
      const pos = Math.round((i + t * speed) % n);
      if (pos < n) pixels[pos] = [0.7, 0.85, 1.0];
    }
    return pixels;
  }

  public renderPlaylist(t: number, sceneDuration = 24.0, crossfade = 1.2): { pixels: RGB[]; currentScene: SceneMeta } {
    const totalScenes = SCENE_METADATA.length;
    const totalCycle = totalScenes * sceneDuration;
    const tCycle = t % totalCycle;

    const sceneIdx = Math.floor(tCycle / sceneDuration);
    const sceneTime = tCycle % sceneDuration;
    const currentMeta = SCENE_METADATA[sceneIdx];

    let frame = this.renderScene(currentMeta.id, t);

    // Crossfade into next scene
    if (sceneTime > sceneDuration - crossfade) {
      const nextIdx = (sceneIdx + 1) % totalScenes;
      const alpha = (sceneTime - (sceneDuration - crossfade)) / crossfade;
      const nextFrame = this.renderScene(SCENE_METADATA[nextIdx].id, t);
      frame = blendFrames(frame, nextFrame, alpha);
    }

    return { pixels: frame, currentScene: currentMeta };
  }
}
