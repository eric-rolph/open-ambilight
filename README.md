# ⚡ Open Ambilight

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Web Serial API](https://img.shields.io/badge/Web%20Serial-Supported-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)

> **Universal in-browser addressable LED controller, Ambilight screen mirror, and 23-scene retro light show suite for Windows 11 to Android OS.**

🔗 **Live Web App:** [https://eric-rolph.github.io/open-ambilight/](https://eric-rolph.github.io/open-ambilight/)

---

## 🌟 Overview

**Open Ambilight** is a modern, zero-install Web Application and Progressive Web App (PWA) designed to control USB-connected Ambilight LED Strip Kits (WS2812B, SK6812, WS2811, Arduino / CH340) directly from your browser at a rock-solid 60 FPS.

Using the standard W3C **Web Serial API**, you can plug your LED strip into any Windows 11 PC (Chrome, Edge, Opera, or Brave) or Android device via USB-OTG, open the web app, click **"Connect USB Strip"**, and immediately control your lights with zero drivers or background Python software required!

---

## ✨ Features

### 🎮 1. The 23-Scene Light Show
Every scene is rendered in real-time with sub-pixel physics, collision dynamics, and authentic color calibration:
* **Retro Games:**
  * 🍄 **Super Mario Bros.** — Mario hits the pulsing Question block, releases the bouncing Starman, and sprints invincible in flashing rainbow glory to the castle flagpole!
  * 🦔 **Sonic the Hedgehog** — Sonic revs his Spin Dash with friction sparks, scoops up spinning golden rings, slams a red spring bumper, and smashes Badniks!
  * 🟡 **1D Pac-Man Arcade Chase** — Pac-Man chomping dots while pursued by ghosts; eats a flashing Power Pellet and turns to hunt the blue ghosts!
  * 🐸 **Frogger: Highway & River** — Neon lime-green frog hops rhythmically across multi-lane rushing traffic, navigates river logs, and lands on the goal lilypad.
  * 🐍 **1D Snake Game Auto-Hunter** — Autonomous growing rainbow snake slithering across the strip, hunting apples and growing longer.
* **Arcade Action:**
  * 🎯 **Nerf Dart Dueling Blasters** — Opposite-end duels with authentic blue foam, scarlet rubber tips, variable flight velocities, and snappy kinetic collision explosions!
  * 🧱 **1D Breakout Brick-Smasher** — Paddle ball tracking with shattering rainbow brick particle showers.
  * 🐉 **Dragon vs. Phoenix Beam Clash** — Azure dragon breath vs. crimson phoenix plasma in a crackling energy tug-of-war.
  * 🚀 **Micro Spaceship Dogfight** — Two fighters executing tactical evasive maneuvers and red laser bursts with shield impacts.
  * 🚨 **Rainbow KITT Scanner** — Knight Rider cyclon scanner with chromatic trails and turnaround afterburner flares.
* **Cosmic & Particle Physics:**
  * ⚛️ **Large Hadron Collider** — Counter-rotating relativistic proton beams smashing in a brilliant subatomic quark shower.
  * 🌌 **Black Hole Accretion Disk** — Gravitational matter spiral into an event horizon erupting into relativistic quasar plasma jets.
  * 🌀 **Wormhole Portal Teleportation** — Aperture-style blue and orange portals with velocity-preserved light packet teleportation.
  * 🎱 **Elastic Rainbow Billiards** — Physics-accurate conservation of momentum across colored billiard spheres.
  * 📊 **Rainbow Quicksort Visualizer** — Live randomized color spectrum sorted using animated pivot comparisons.
  * 🚀 **Warp-Drive Hyper-Chase** — Relativistic starfield accelerating toward hyper-speed light warp with blue-shifted compression.
* **Ambient & Flow:**
  * 🌌 **Hyper-Breathing Aurora** — Deep multi-phase northern lights with subtle stellar sparkles.
  * 💥 **Supernova Shockwaves** — Core-collapse stellar detonations blasting expanding neon shock rings.
  * ☄️ **Dueling Laser Comets** — Twin high-speed comets with chromatic ion tails sweeping across the strip.
  * 🧬 **Double-Helix DNA Weave** — Two counter-scrolling intertwining wave ribbons simulating a rotating 3D DNA molecule.
  * ⚡ **Electric Lightning Storm** — High-voltage electric discharges with jagged leader strokes and fading afterglow.
  * 🎆 **Firework Mortar Shells** — Gravity-curved mortar launches bursting at their apex into glittering cascading crackles.
  * 🧪 **Thermal Lava Lamp Metaballs** — Heated thermal blobs floating, merging, and dividing with fluid surface tension.

---

### 🖥️ 2. Real-Time Virtual Strip Simulator
* Includes a high-DPI HTML5 Canvas simulating an addressable 150-LED strip with realistic diode casings, phosphor cores, and diffused neon reflections onto a virtual dark backdrop.
* Test, preview, and enjoy all animations directly in your browser even without physical hardware plugged in.

### 🎨 3. Full Standard LED Controls
* **Playlist Mode:** Auto-rotates through all 23 scenes with customizable per-scene duration and smooth crossfades.
* **Scene Lock / Manual Selector:** Choose and lock onto any specific animation with category filters.
* **Static Colors & Mood Presets:** 16-million RGB hex color picker + 9 curated ambient presets (Warm Amber, Warm White 3000K, Daylight 5000K, Cyberpunk Neon, Synthwave, Matrix Green, Deep Oceanic, etc.).
* **Screen Ambilight Mirroring:** Native `getDisplayMedia` screen edge capture to mirror games and movies behind your monitor.
* **Sound & Music Reactive Visualizer:** Live microphone/system audio analysis using Web Audio API with sub-bass kick detection and frequency mapping.
* **Hardware Config:** Customizable LED count (30–300), baud rate (115200, 230400, etc.), color channel order (RGB, GRB, BGR), and Perceptual Gamma 2.2 correction.

### 📱 4. Cross-Platform for Windows 11 & Android OS
* **Windows 11 (Chrome, Edge, Opera, Brave):** Direct one-click USB connection via Web Serial API.
* **Android OS (USB-OTG):** Connect your Ambilight kit to your Android phone/tablet using a USB-OTG cable and control it in Chrome for Android!
* **Android OS (Wi-Fi Companion):** Run the included lightweight `python bridge.py` companion script on your PC to control your lights wirelessly from your phone's browser from anywhere on your home network!
* **PWA Installable:** Install as a standalone native app on Windows 11 and Android home screens.

---

## 🚀 Quick Start

### Option A: Use the Web App (No Install)
1. Open **[https://eric-rolph.github.io/open-ambilight/](https://eric-rolph.github.io/open-ambilight/)** in Chrome or Edge.
2. Plug your Ambilight USB kit into your PC or Android OTG adapter.
3. Click **"Connect USB Strip"** in the top-right corner.
4. Select your device's COM port (e.g., `USB-SERIAL CH340` or `Arduino`).
5. Your physical lights are now live!

### Option B: Run Locally from Source
```bash
# Clone the repository
git clone https://github.com/eric-rolph/open-ambilight.git
cd open-ambilight

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Option C: Wi-Fi Remote Control for Android / Mobile
If your LED strip is plugged into your PC and you want to control it from your Android phone on your couch:
```bash
python bridge.py
# Opens local server at http://<YOUR-PC-IP>:8080
# Open that URL on your phone's mobile browser to control the lights wirelessly!
```

---

## 🔌 Hardware Compatibility & Protocol

* **Supported Microcontrollers:** Arduino Nano/Uno, ESP8266, ESP32, Raspberry Pi Pico, CH340 / CP2102 / FTDI USB-to-Serial bridges.
* **Supported LED Chips:** WS2812B, WS2811, SK6812, APA102.
* **Adalight Protocol:** 6-byte header `['A', 'd', 'a', hi, lo, chk]` where `chk = hi ^ lo ^ 0x55` at 115,200 baud (8N1).

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.
