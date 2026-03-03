type FishyElements = {
  canvas: HTMLCanvasElement | null
  scoreEl: HTMLElement | null
  sizeEl: HTMLElement | null
  statusEl: HTMLElement | null
  levelEl: HTMLElement | null
  hudEl: HTMLElement | null
}

export function startFishyGame({
  canvas,
  scoreEl,
  sizeEl,
  statusEl,
  levelEl,
  hudEl,
}: FishyElements) {
  if (!canvas || !scoreEl || !sizeEl || !statusEl || !levelEl || !hudEl) {
    return () => {};
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  /* ═══════════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════════ */
  const pointer = { x: 0, y: 0 };
  const player = { x: 0, y: 0, size: 20, vx: 0 };
  const fishes = [];
  const bubbles = [];
  const particles = [];
  const seaweeds = [];
  const driftingTexts = []; // existential messages that float
  let score = 0;
  let level = 1;
  let eaten = 0; // total fish consumed — drives the horror
  let isGameOver = false;
  let spawnTimer = 0;
  let lastTime = 0;
  let comboCount = 0;
  let comboTimer = 0;
  let shakeAmount = 0;
  let highScore = parseInt(localStorage.getItem("fishyHighScore") || "0", 10);

  /* ── the dread ── 0 = cheerful ocean, 1 = full abyss */
  function getDread() { return Math.min(1, eaten / 120); }

  /* ── horror text pools by dread tier ── */
  const WHISPERS = [
    // tier 0.15+
    ["they had families", "was it worth it?", "you're getting bigger...", "they can't swim away fast enough"],
    // tier 0.3+
    ["do you even taste them anymore?", "the water is turning red", "their eyes were open", "you used to be their size",
     "how many is enough?", "the small ones trusted you"],
    // tier 0.5+
    ["you are becoming the void", "there is no bottom to this hunger", "you ate something that loved",
     "what are you now?", "the ocean remembers every one", "they scream underwater too"],
    // tier 0.7+
    ["you are the reason they flee", "nothing will fill this emptiness", "your reflection has too many teeth",
     "consumption is not creation", "you've forgotten what hunger felt like — this is just habit",
     "the biggest fish is always alone", "something is swimming behind your eyes"],
    // tier 0.9+
    ["there is nothing left to eat but yourself", "the ocean is empty because of you",
     "you won — was it worth becoming this?", "you can never go back to being small",
     "every fish you ate was the main character of its own story",
     "the game doesn't end — you do", "you can feel gills opening in your throat",
     "there are voices in the bubbles and they are yours"],
  ];

  function getWhisperTier() {
    const d = getDread();
    if (d >= 0.9) return 4;
    if (d >= 0.7) return 3;
    if (d >= 0.5) return 2;
    if (d >= 0.3) return 1;
    if (d >= 0.15) return 0;
    return -1;
  }

  /* ═══════════════════════════════════════════════════════
     AUDIO — procedural dark ambient via Web Audio API
     ═══════════════════════════════════════════════════════ */
  let audioCtx = null;
  let masterGain = null;
  let droneOsc1 = null, droneOsc2 = null, droneGain = null;
  let subBass = null, subGain = null;
  let noiseNode = null, noiseGain = null;
  let heartbeatInterval = null;
  let audioUnlocked = false;
  let audioInitFailed = false;
  let frameId = null;
  let isDestroyed = false;

  function initAudio() {
    if (audioCtx || audioInitFailed) return !!audioCtx;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      audioInitFailed = true;
      return false;
    }

    try {
      audioCtx = new AudioCtor();
    } catch {
      audioInitFailed = true;
      return false;
    }

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    // Drone oscillators — detuned for unease
    droneGain = audioCtx.createGain();
    droneGain.gain.value = 0;
    droneGain.connect(masterGain);

    droneOsc1 = audioCtx.createOscillator();
    droneOsc1.type = "sawtooth";
    droneOsc1.frequency.value = 55; // low A
    const droneFilter1 = audioCtx.createBiquadFilter();
    droneFilter1.type = "lowpass";
    droneFilter1.frequency.value = 200;
    droneFilter1.Q.value = 8;
    droneOsc1.connect(droneFilter1).connect(droneGain);
    droneOsc1.start();

    droneOsc2 = audioCtx.createOscillator();
    droneOsc2.type = "sawtooth";
    droneOsc2.frequency.value = 55.4; // slightly detuned — beating
    const droneFilter2 = audioCtx.createBiquadFilter();
    droneFilter2.type = "lowpass";
    droneFilter2.frequency.value = 180;
    droneFilter2.Q.value = 10;
    droneOsc2.connect(droneFilter2).connect(droneGain);
    droneOsc2.start();

    // Sub-bass pulse
    subGain = audioCtx.createGain();
    subGain.gain.value = 0;
    subGain.connect(masterGain);
    subBass = audioCtx.createOscillator();
    subBass.type = "sine";
    subBass.frequency.value = 30;
    subBass.connect(subGain);
    subBass.start();

    // Filtered noise — underwater rushing / dread texture
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) noiseData[i] = Math.random() * 2 - 1;
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0;
    const noiseFilt = audioCtx.createBiquadFilter();
    noiseFilt.type = "bandpass";
    noiseFilt.frequency.value = 300;
    noiseFilt.Q.value = 3;
    noiseNode.connect(noiseFilt).connect(noiseGain).connect(masterGain);
    noiseNode.start();

    return true;
  }

  async function unlockAudioFromGesture() {
    if (audioUnlocked || audioInitFailed) return;
    if (!initAudio() || !audioCtx) return;
    try {
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      audioUnlocked = true;
      startHeartbeat();
    } catch {
      // Keep the game playable if audio can't be resumed.
    }
  }

  function updateAudio() {
    if (!audioCtx) return;
    const d = getDread();
    const t = audioCtx.currentTime;

    // Master fades in as dread builds
    masterGain.gain.setTargetAtTime(0.15 + d * 0.55, t, 0.5);

    // Drone gets louder and drops in pitch
    droneGain.gain.setTargetAtTime(d * 0.6, t, 0.3);
    droneOsc1.frequency.setTargetAtTime(55 - d * 20, t, 1); // drops to ~35Hz
    droneOsc2.frequency.setTargetAtTime(55.4 - d * 19, t, 1);

    // Sub-bass throb increases
    subGain.gain.setTargetAtTime(d * 0.45, t, 0.4);
    subBass.frequency.setTargetAtTime(30 + Math.sin(t * 0.3) * d * 10, t, 0.2);

    // Noise texture
    noiseGain.gain.setTargetAtTime(d * 0.25, t, 0.5);
  }

  function playEatSound() {
    if (!audioCtx) return;
    const d = getDread();
    const t = audioCtx.currentTime;

    if (d < 0.3) {
      // Cheerful pop
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g).connect(masterGain);
      osc.start(t); osc.stop(t + 0.12);
    } else {
      // Wet crunch that gets worse
      const dur = 0.1 + d * 0.15;
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const env = Math.pow(1 - i / data.length, 2);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const filt = audioCtx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 400 + (1 - d) * 600;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.2 + d * 0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(filt).connect(g).connect(masterGain);
      src.start(t);

      // Dissonant tone underneath
      if (d > 0.5) {
        const osc = audioCtx.createOscillator();
        osc.type = "square";
        osc.frequency.value = 80 + Math.random() * 60;
        const og = audioCtx.createGain();
        og.gain.setValueAtTime(0.06 * d, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(og).connect(masterGain);
        osc.start(t); osc.stop(t + 0.3);
      }
    }
  }

  function playHeartbeat() {
    if (!audioCtx) return;
    const d = getDread();
    if (d < 0.6) return;
    const t = audioCtx.currentTime;
    const vol = (d - 0.6) * 1.5; // 0 → 0.6 as dread goes 0.6→1

    function beat(offset) {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(50, t + offset);
      osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.15);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.25 * vol, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.2);
      osc.connect(g).connect(audioCtx.destination); // bypass master for rawness
      osc.start(t + offset); osc.stop(t + offset + 0.25);
    }
    beat(0);
    beat(0.18);
  }

  function startHeartbeat() {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(playHeartbeat, 900);
  }

  function stopAudio() {
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    if (masterGain && audioCtx) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
  }

  /* ═══════════════════════════════════════════════════════
     FISH COLOR PALETTES
     ═══════════════════════════════════════════════════════ */
  const FISH_PALETTES = {
    small: ["#7cf2b8", "#6ee7b7", "#34d399", "#5eead4", "#67e8f9", "#a7f3d0"],
    medium: ["#fbbf24", "#f59e0b", "#fb923c", "#fdba74"],
    danger: ["#ff7d94", "#f87171", "#fb7185", "#ef4444", "#e11d48"],
    rare: ["#c084fc", "#a78bfa", "#818cf8", "#e879f9"],
  };

  /* Palette degrades with dread */
  function corruptColor(hex, dread) {
    if (dread < 0.15) return hex;
    // Parse hex
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Desaturate & darken towards sickly tones
    const grey = (r + g + b) / 3;
    const mix = Math.min(1, dread * 1.3);
    const nr = Math.round(r + (grey * 0.6 - r) * mix);
    const ng = Math.round(g + (grey * 0.45 - g) * mix);
    const nb = Math.round(b + (grey * 0.5 - b) * mix);
    return `rgb(${nr},${ng},${nb})`;
  }

  /* ═══════════════════════════════════════════════════════
     SEAWEED
     ═══════════════════════════════════════════════════════ */
  function generateSeaweeds() {
    seaweeds.length = 0;
    const count = Math.floor(canvas.width / 80) + 3;
    for (let i = 0; i < count; i++) {
      seaweeds.push({
        x: Math.random() * canvas.width,
        height: 60 + Math.random() * 120,
        width: 12 + Math.random() * 18,
        segments: 4 + Math.floor(Math.random() * 4),
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? "#0d6b3c" : "#15803d",
      });
    }
  }

  /* ═══════════════════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════════════════ */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!player.x && !player.y) {
      player.x = window.innerWidth * 0.5;
      player.y = window.innerHeight * 0.5;
      pointer.x = player.x;
      pointer.y = player.y;
    }
    generateSeaweeds();
  }

  function W() { return window.innerWidth; }
  function H() { return window.innerHeight; }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpHex(h1, h2, t) {
    const r1 = parseInt(h1.slice(1,3),16), g1 = parseInt(h1.slice(3,5),16), b1 = parseInt(h1.slice(5,7),16);
    const r2 = parseInt(h2.slice(1,3),16), g2 = parseInt(h2.slice(3,5),16), b2 = parseInt(h2.slice(5,7),16);
    const r = Math.round(lerp(r1,r2,t)), g = Math.round(lerp(g1,g2,t)), b = Math.round(lerp(b1,b2,t));
    return `rgb(${r},${g},${b})`;
  }

  /* ═══════════════════════════════════════════════════════
     LEVELS
     ═══════════════════════════════════════════════════════ */
  function getLevel() {
    if (score >= 800) return 8;
    if (score >= 600) return 7;
    if (score >= 450) return 6;
    if (score >= 320) return 5;
    if (score >= 200) return 4;
    if (score >= 120) return 3;
    if (score >= 50) return 2;
    return 1;
  }
  function getSpawnInterval() {
    // Keep early game approachable and slow spawn cadence when fish sizes get large.
    const base = 0.8 - level * 0.04;
    const bigFishSlowdown = Math.max(0, level - 4) * 0.12;
    return Math.min(1.25, Math.max(0.38, base + bigFishSlowdown));
  }
  function getMaxFishSize() { return 30 + level * 10; }

  /* ═══════════════════════════════════════════════════════
     SPAWN HELPERS
     ═══════════════════════════════════════════════════════ */
  function spawnFish() {
    const fromLeft = Math.random() > 0.5;
    const maxSize = getMaxFishSize();
    const size = rand(6, maxSize);
    const speedBase = rand(40, 140) / Math.max(size / 18, 1);
    const speed = speedBase * (1 + level * 0.06);
    const y = rand(30, H() - 30);
    const isRare = Math.random() < 0.08;
    let palette;
    if (isRare) palette = FISH_PALETTES.rare;
    else if (size <= player.size * 0.5) palette = FISH_PALETTES.small;
    else if (size <= player.size) palette = FISH_PALETTES.medium;
    else palette = FISH_PALETTES.danger;

    fishes.push({
      x: fromLeft ? -70 : W() + 70,
      y, vx: fromLeft ? speed : -speed, vy: rand(-22, 22),
      size, color: pickRandom(palette), isRare, scaleAnim: 0,
      pattern: Math.floor(Math.random() * 3),
    });
  }

  function spawnBubble(x, y) {
    const d = getDread();
    bubbles.push({
      x: x + rand(-10, 10), y,
      r: rand(2, 7),
      speed: rand(20, 60),
      wobble: rand(0, Math.PI * 2),
      alpha: rand(0.3, 0.7),
      bloody: d > 0.35 && Math.random() < d, // blood bubbles at high dread
    });
  }

  function spawnParticle(x, y, color) {
    const d = getDread();
    const count = d > 0.5 ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particles.push({
        x, y,
        vx: Math.cos(angle) * rand(30, 80),
        vy: Math.sin(angle) * rand(30, 80),
        r: rand(2, d > 0.4 ? 7 : 5),
        color: d > 0.35 ? (Math.random() < d ? "#8b0000" : color) : color,
        life: 1,
      });
    }
  }

  function spawnWhisper() {
    const tier = getWhisperTier();
    if (tier < 0) return;
    const pool = WHISPERS[tier];
    const text = pickRandom(pool);
    // Don't repeat if already visible
    if (driftingTexts.some(dt => dt.text === text)) return;
    driftingTexts.push({
      text,
      x: rand(W() * 0.1, W() * 0.9),
      y: rand(H() * 0.15, H() * 0.85),
      life: 1,
      maxLife: 4 + Math.random() * 3,
      size: 14 + Math.random() * 10,
      drift: rand(-8, 8),
    });
  }

  /* ═══════════════════════════════════════════════════════
     DRAWING — BACKGROUND
     ═══════════════════════════════════════════════════════ */
  function drawBackground(timestamp) {
    const d = getDread();

    // Ocean gradient — cheerful blue → blood-black abyss
    const grad = ctx.createLinearGradient(0, 0, 0, H());
    grad.addColorStop(0, lerpHex("#1a8fc4", "#1a0505", d));
    grad.addColorStop(0.3, lerpHex("#1578a8", "#120304", d));
    grad.addColorStop(0.7, lerpHex("#0d5f8a", "#080102", d));
    grad.addColorStop(1, lerpHex("#062a45", "#000000", d));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W(), H());

    // Light rays — fade out with dread
    if (d < 0.85) {
      ctx.save();
      ctx.globalAlpha = 0.06 * (1 - d);
      for (let i = 0; i < 7; i++) {
        const rayX = (i * W() / 6) + Math.sin(timestamp * 0.0003 + i) * 40;
        const rayW = 30 + Math.sin(timestamp * 0.0005 + i * 2) * 15;
        const gradient = ctx.createLinearGradient(rayX, 0, rayX, H() * 0.8);
        gradient.addColorStop(0, d > 0.5 ? "#4a0000" : "#fffbe6");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(rayX - rayW, 0);
        ctx.lineTo(rayX + rayW, 0);
        ctx.lineTo(rayX + rayW * 2.5, H() * 0.8);
        ctx.lineTo(rayX - rayW * 2.5, H() * 0.8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Caustics → at high dread, become pulsing red orbs
    ctx.globalAlpha = d > 0.6 ? 0.04 + d * 0.06 : 0.08 * (1 - d * 0.5);
    for (let i = 0; i < 30; i++) {
      const cx = ((i * 173.7 + timestamp * 0.02) % (W() + 100)) - 50;
      const cy = ((i * 113.3 + timestamp * 0.015) % (H() + 100)) - 50;
      const r = 10 + Math.sin(timestamp * 0.001 + i) * (6 + d * 8);
      ctx.fillStyle = d > 0.5 ? `rgba(120,0,0,${0.3 * d})` : "#8dd8f8";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Sandy bottom → turns dark, then disappears into void
    const sandY = H() - 40;
    const sandGrad = ctx.createLinearGradient(0, sandY, 0, H());
    sandGrad.addColorStop(0, lerpHex("#c2956a", "#2a1008", d));
    sandGrad.addColorStop(1, lerpHex("#8b6a3e", "#000000", d));
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, sandY);
    for (let x = 0; x <= W(); x += 20) {
      ctx.lineTo(x, sandY + Math.sin(x * 0.02 + timestamp * 0.001) * (6 + d * 10));
    }
    ctx.lineTo(W(), H());
    ctx.lineTo(0, H());
    ctx.closePath();
    ctx.fill();

    // Pebbles become bones at high dread
    if (d < 0.9) {
      ctx.globalAlpha = 0.3 * (1 - d);
      for (let i = 0; i < 20; i++) {
        const px = (i * 137 + 50) % W();
        const py = sandY + 10 + (i * 7) % 20;
        ctx.fillStyle = d > 0.5 ? "#d4c4a0" : (i % 3 === 0 ? "#9a7d5a" : "#a8916e");
        ctx.beginPath();
        if (d > 0.5) {
          // Tiny fish bones
          ctx.ellipse(px, py, 5 + (i % 3), 1.5, (i * 0.5), 0, Math.PI * 2);
        } else {
          ctx.ellipse(px, py, 3 + (i % 4), 2 + (i % 3), 0, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ═══════════════════════════════════════════════════════
     DRAWING — SEAWEED (withers with dread)
     ═══════════════════════════════════════════════════════ */
  function drawSeaweed(timestamp) {
    const d = getDread();
    if (d > 0.95) return; // all dead
    for (const sw of seaweeds) {
      ctx.save();
      const swColor = d > 0.4
        ? lerpHex(sw.color === "#0d6b3c" ? "#0d6b3c" : "#15803d", "#1a0a00", Math.min(1, d * 1.5))
        : sw.color;
      ctx.fillStyle = swColor;
      ctx.globalAlpha = 0.6 * (1 - d * 0.8);
      const baseY = H() - 35;
      let prevX = sw.x;
      let prevY = baseY;
      // Seaweed shrinks with dread
      const heightMult = 1 - d * 0.7;
      const segH = (sw.height * heightMult) / sw.segments;
      for (let s = 0; s < sw.segments; s++) {
        const swayAmt = (8 + s * 3) * (1 + d * 3); // more erratic at high dread
        const sway = Math.sin(timestamp * (0.001 + d * 0.003) + sw.phase + s * 0.5) * swayAmt;
        const cx = sw.x + sway;
        const cy = baseY - (s + 1) * segH;
        const w = sw.width * (1 - s / sw.segments * 0.6) * (1 - d * 0.5);
        ctx.beginPath();
        ctx.moveTo(prevX - w / 2, prevY);
        ctx.quadraticCurveTo(cx, cy + segH * 0.3, cx - w / 3, cy);
        ctx.lineTo(cx + w / 3, cy);
        ctx.quadraticCurveTo(cx, cy + segH * 0.3, prevX + w / 2, prevY);
        ctx.closePath();
        ctx.fill();
        prevX = cx;
        prevY = cy;
      }
      ctx.restore();
    }
  }

  /* ═══════════════════════════════════════════════════════
     DRAWING — FISH (corrupts with dread)
     ═══════════════════════════════════════════════════════ */
  function drawFish(fish, isPlayer) {
    const d = getDread();
    const facingRight = isPlayer ? (pointer.x >= player.x) : (fish.vx >= 0);
    ctx.save();
    ctx.translate(fish.x, fish.y);

    // At high dread, fish warp and twist
    if (d > 0.3 && !isPlayer) {
      const warp = Math.sin(Date.now() * 0.005 + fish.x * 0.01) * d * 0.3;
      ctx.transform(1, warp, -warp * 0.5, 1, 0, 0);
    }

    // Player distorts at extreme dread
    if (isPlayer && d > 0.6) {
      const pulse = 1 + Math.sin(Date.now() * 0.008) * d * 0.08;
      const skew = Math.sin(Date.now() * 0.003) * (d - 0.6) * 0.15;
      ctx.transform(pulse, skew, -skew, pulse, 0, 0);
    }

    if (!facingRight) ctx.scale(-1, 1);

    const s = fish.size;
    let bodyColor;
    if (isPlayer) {
      bodyColor = d > 0.5 ? lerpHex("#ffd166", "#2a0a0a", (d - 0.5) * 2) : "#ffd166";
    } else {
      bodyColor = corruptColor(fish.color, d);
    }

    // Shadow/glow — becomes sinister
    if (isPlayer) {
      ctx.shadowColor = d > 0.5 ? `rgba(140,0,0,${d * 0.6})` : "#ffd16688";
      ctx.shadowBlur = 15 + d * 20;
    } else if (fish.isRare) {
      ctx.shadowColor = fish.color + "88";
      ctx.shadowBlur = 12;
    }

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Patterns — at high dread patterns become scars/veins
    if (!isPlayer) {
      if (d > 0.5) {
        // Vein-like marks
        ctx.globalAlpha = d * 0.4;
        ctx.strokeStyle = "#4a0000";
        ctx.lineWidth = Math.max(0.5, s * 0.03);
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const sx = rand(-s * 0.5, s * 0.3);
          ctx.moveTo(sx, -s * 0.3);
          ctx.quadraticCurveTo(sx + rand(-5, 5), 0, sx + rand(-8, 8), s * 0.3);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (fish.pattern === 1) {
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = Math.max(1, s * 0.06);
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(i * s * 0.2, -s * 0.4);
          ctx.lineTo(i * s * 0.2, s * 0.4);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (fish.pattern === 2) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#fff";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(-s * 0.3 + i * s * 0.3, (i % 2 === 0 ? -1 : 1) * s * 0.15, Math.max(1.5, s * 0.08), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    // Belly — fades to dark
    ctx.fillStyle = d > 0.4 ? `rgba(60,10,10,${0.15 + d * 0.1})` : "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.12, s * 0.7, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dorsal fin
    ctx.fillStyle = isPlayer
      ? (d > 0.5 ? lerpHex("#f0b429", "#3a0505", (d-0.5)*2) : "#f0b429")
      : corruptColor(fish.color, d);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.9, s * 0.4, -s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Tail — becomes jagged at high dread
    ctx.fillStyle = isPlayer
      ? (d > 0.5 ? lerpHex("#f0b429", "#3a0505", (d-0.5)*2) : "#f0b429")
      : bodyColor;
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    if (d > 0.6 && !isPlayer) {
      // Tattered tail
      ctx.lineTo(-s - s * 0.7, -s * 0.45);
      ctx.lineTo(-s - s * 0.4, -s * 0.1);
      ctx.lineTo(-s - s * 0.8, 0);
      ctx.lineTo(-s - s * 0.4, s * 0.1);
      ctx.lineTo(-s - s * 0.7, s * 0.45);
    } else {
      ctx.lineTo(-s - s * 0.75, -s * 0.4);
      ctx.quadraticCurveTo(-s - s * 0.5, 0, -s - s * 0.75, s * 0.4);
    }
    ctx.closePath();
    ctx.fill();

    // Eye — grows wide with terror for NPC fish; player's eye becomes...wrong
    const eyeScale = isPlayer ? 1 + d * 0.6 : (d > 0.3 ? 1 + d * 0.8 : 1);
    const eyeR = Math.max(2.5, s * 0.16 * eyeScale);
    const pupilR = Math.max(1.5, s * 0.09 * (isPlayer ? (1 + d * 0.4) : (d > 0.3 ? (0.6 - d * 0.3) : 1)));

    // NPC fish at high dread: wide terrified eyes
    ctx.fillStyle = d > 0.5 && !isPlayer ? "#ffeeee" : "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.4, -s * 0.1, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Pupil — player's turns red; NPCs' become pinpricks
    ctx.fillStyle = isPlayer && d > 0.5
      ? lerpHex("#0f172a", "#8b0000", (d - 0.5) * 2)
      : "#0f172a";
    ctx.beginPath();
    ctx.arc(s * 0.45, -s * 0.1, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = d > 0.7 && isPlayer ? "#ff000044" : "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.48, -s * 0.15, Math.max(0.8, s * 0.04), 0, Math.PI * 2);
    ctx.fill();

    // Second eye at very high player dread (wrong, extra eye)
    if (isPlayer && d > 0.8) {
      ctx.globalAlpha = (d - 0.8) * 5;
      ctx.fillStyle = "#ffeeee";
      ctx.beginPath();
      ctx.arc(s * 0.1, -s * 0.25, eyeR * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8b0000";
      ctx.beginPath();
      ctx.arc(s * 0.12, -s * 0.25, pupilR * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Mouth — becomes a gaping maw for the player
    if (isPlayer && d > 0.4) {
      const mouthOpen = (d - 0.4) * 1.6;
      ctx.fillStyle = `rgba(30,0,0,${0.7 * mouthOpen})`;
      ctx.beginPath();
      ctx.ellipse(s * 0.7, s * 0.05, s * 0.18 * mouthOpen, s * 0.12 * mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
      // Teeth
      if (d > 0.6) {
        ctx.fillStyle = `rgba(220,220,200,${mouthOpen})`;
        const teeth = Math.floor(3 + d * 4);
        for (let t = 0; t < teeth; t++) {
          const angle = -0.6 + (t / teeth) * 1.2;
          const tx = s * 0.7 + Math.cos(angle) * s * 0.15 * mouthOpen;
          const ty = s * 0.05 + Math.sin(angle) * s * 0.1 * mouthOpen;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + 1.5, ty + (angle < 0.3 ? -3 : 3) * mouthOpen);
          ctx.lineTo(tx - 1.5, ty + (angle < 0.3 ? -3 : 3) * mouthOpen);
          ctx.closePath();
          ctx.fill();
        }
      }
    } else {
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      ctx.arc(s * 0.65, s * 0.05, Math.max(2, s * 0.1), -0.3, 0.6);
      ctx.stroke();
    }

    // Player crown → becomes broken/dark at high dread
    if (isPlayer && player.size >= 40) {
      ctx.globalAlpha = 0.9;
      ctx.font = `${Math.min(s * 0.5, 24)}px serif`;
      ctx.textAlign = "center";
      if (d > 0.7) {
        ctx.fillStyle = "#8b0000";
        ctx.fillText("💀", 0, -s * 0.65);
      } else if (d > 0.4) {
        ctx.fillStyle = "#888";
        ctx.fillText("👑", 0, -s * 0.65);
      } else {
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("👑", 0, -s * 0.65);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════
     DRAWING — EFFECTS
     ═══════════════════════════════════════════════════════ */
  function drawBubbles(dt) {
    const d = getDread();
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.speed * dt;
      b.x += Math.sin(b.wobble) * 0.4;
      b.wobble += 2 * dt;
      b.alpha -= 0.12 * dt;
      if (b.alpha <= 0 || b.y < -20) { bubbles.splice(i, 1); continue; }
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = b.bloody ? "#8b0000" : (d > 0.5 ? "#553333" : "#cceeff");
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      if (!b.bloody) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= 1.8 * dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawWhispers(dt) {
    for (let i = driftingTexts.length - 1; i >= 0; i--) {
      const w = driftingTexts[i];
      w.life -= dt / w.maxLife;
      w.y -= 6 * dt;
      w.x += w.drift * dt;
      if (w.life <= 0) { driftingTexts.splice(i, 1); continue; }

      const fadeIn = Math.min(1, (1 - w.life) * 5);
      const fadeOut = Math.min(1, w.life * 4);
      ctx.save();
      ctx.globalAlpha = Math.min(fadeIn, fadeOut) * 0.7;
      ctx.fillStyle = getDread() > 0.7 ? "#aa0000" : "#ccaaaa";
      ctx.font = `italic ${w.size}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Slight glitch at high dread
      if (getDread() > 0.6 && Math.random() < 0.05) {
        ctx.translate(rand(-3, 3), rand(-2, 2));
      }

      ctx.fillText(w.text, w.x, w.y);
      ctx.restore();
    }
  }

  function drawCombo() {
    if (comboCount < 2 || comboTimer <= 0) return;
    const d = getDread();
    ctx.save();
    ctx.globalAlpha = Math.min(1, comboTimer);
    if (d > 0.5) {
      ctx.fillStyle = "#8b0000";
    } else {
      ctx.fillStyle = comboCount >= 5 ? "#fbbf24" : comboCount >= 3 ? "#fb923c" : "#67e8f9";
    }
    ctx.font = `800 ${Math.min(28 + comboCount * 3, 52)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const bounce = Math.sin(Date.now() * 0.01) * 4;
    const text = d > 0.5
      ? (comboCount >= 5 ? `${comboCount} devoured` : `${comboCount} consumed`)
      : (comboCount >= 5 ? `🔥 ${comboCount}x COMBO!` : `${comboCount}x Combo!`);
    ctx.fillText(text, W() / 2, 80 + bounce);
    ctx.restore();
  }

  /* Vignette — darkness creeps in from edges */
  function drawVignette() {
    const d = getDread();
    if (d < 0.1) return;
    const gradient = ctx.createRadialGradient(W()/2, H()/2, Math.min(W(),H()) * (0.5 - d * 0.25), W()/2, H()/2, Math.max(W(),H()) * 0.75);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, `rgba(0,0,0,${d * 0.85})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W(), H());
  }

  /* Scan line / static overlay at high dread */
  function drawStatic() {
    const d = getDread();
    if (d < 0.6) return;
    const intensity = (d - 0.6) * 2.5;

    // Scanlines
    ctx.fillStyle = `rgba(0,0,0,${0.03 * intensity})`;
    for (let y = 0; y < H(); y += 3) {
      ctx.fillRect(0, y, W(), 1);
    }

    // Random static bursts
    if (Math.random() < intensity * 0.08) {
      const sx = rand(0, W());
      const sy = rand(0, H());
      const sw = rand(20, 200);
      const sh = rand(2, 8);
      ctx.fillStyle = `rgba(${d > 0.8 ? '80,0,0' : '40,40,40'},${rand(0.05, 0.15)})`;
      ctx.fillRect(sx, sy, sw, sh);
    }
  }

  // Late-game hallucinations: fleeting shapes near the player.
  function drawHallucinations(timestamp) {
    const d = getDread();
    if (d < 0.75) return;

    const intensity = (d - 0.75) / 0.25;
    const pulse = 0.35 + Math.sin(timestamp * 0.012) * 0.15;
    ctx.save();
    ctx.globalAlpha = Math.max(0, pulse * intensity);
    ctx.strokeStyle = `rgba(130, 0, 0, ${0.35 + intensity * 0.4})`;
    ctx.lineWidth = 1 + intensity * 2;
    ctx.beginPath();
    ctx.arc(player.x + rand(-80, 80), player.y + rand(-70, 70), 18 + rand(0, 42), 0, Math.PI * 2);
    ctx.stroke();
    if (Math.random() < 0.2 + intensity * 0.45) {
      ctx.fillStyle = `rgba(140, 0, 0, ${0.08 + intensity * 0.18})`;
      ctx.fillRect(rand(0, W()), rand(0, H()), rand(20, 90), rand(2, 12));
    }
    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════
     GAME LOGIC
     ═══════════════════════════════════════════════════════ */
  function resetGame() {
    player.size = 20;
    player.x = W() * 0.5;
    player.y = H() * 0.5;
    pointer.x = player.x;
    pointer.y = player.y;
    score = 0;
    level = 1;
    eaten = 0;
    comboCount = 0;
    comboTimer = 0;
    fishes.length = 0;
    bubbles.length = 0;
    particles.length = 0;
    driftingTexts.length = 0;
    isGameOver = false;
    statusEl.textContent = "Move with mouse or touch";
    stopAudio();
    updateHud();
  }

  function updateHud() {
    const d = getDread();

    // Toggle horror CSS classes
    hudEl.classList.toggle("dread", d >= 0.3 && d < 0.7);
    hudEl.classList.toggle("abyss", d >= 0.7);
    levelEl.classList.toggle("dread", d >= 0.3 && d < 0.7);
    levelEl.classList.toggle("abyss", d >= 0.7);

    if (d > 0.7) {
      scoreEl.textContent = `💀 ${score}`;
      sizeEl.textContent = `🩸 ${Math.round(player.size)}`;
    } else if (d > 0.3) {
      scoreEl.textContent = `⚠️ ${score}`;
      sizeEl.textContent = `🐟 ${Math.round(player.size)}`;
    } else {
      scoreEl.textContent = `🏆 ${score}`;
      sizeEl.textContent = `🐟 ${Math.round(player.size)}`;
    }
    const newLevel = getLevel();
    if (newLevel !== level) {
      level = newLevel;
      shakeAmount = 8 + d * 15;
    }
    if (d > 0.7) {
      levelEl.textContent = `🕳️ Depth ${level}`;
    } else {
      levelEl.textContent = `⭐ Level ${level}`;
    }
  }

  /* ═══════════════════════════════════════════════════════
     MAIN LOOP
     ═══════════════════════════════════════════════════════ */
  let whisperTimer = 0;

  function step(timestamp) {
    if (isDestroyed) return;
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.04);
    lastTime = timestamp;
    const d = getDread();

    // Screen shake — more unstable at high dread
    ctx.save();
    const shake = shakeAmount + (d > 0.7 ? Math.sin(timestamp * 0.02) * d * 2 : 0);
    if (shake > 0.5) {
      ctx.translate(rand(-shake, shake), rand(-shake, shake));
      shakeAmount *= 0.9;
    } else {
      shakeAmount = 0;
    }

    drawBackground(timestamp);
    drawSeaweed(timestamp);

    if (!isGameOver) {
      // Audio (unlocked on first user gesture)
      updateAudio();

      // Player follow
      const followSpeed = 7;
      const prevX = player.x;
      player.x += (pointer.x - player.x) * followSpeed * dt;
      player.y += (pointer.y - player.y) * followSpeed * dt;
      player.vx = player.x - prevX;
      player.x = Math.max(player.size, Math.min(W() - player.size, player.x));
      player.y = Math.max(player.size, Math.min(H() - player.size, player.y));

      // Bubbles — become less frequent as dread rises
      if (Math.random() < 0.15 * (1 - d * 0.6)) {
        spawnBubble(player.x - player.size * 0.8, player.y);
      }

      // Spawn fish
      spawnTimer += dt;
      if (spawnTimer >= getSpawnInterval()) {
        const maxOnScreen = level >= 7 ? 7 : level >= 5 ? 9 : 11;
        const count = level <= 2 && Math.random() < 0.2 ? 2 : 1;
        for (let i = 0; i < count && fishes.length < maxOnScreen; i++) {
          spawnFish();
        }
        spawnTimer = 0;
      }

      // Combo decay
      comboTimer -= dt;
      if (comboTimer <= 0) comboCount = 0;

      // Whisper timer
      if (d > 0.15) {
        whisperTimer += dt;
        const freq = d > 0.7 ? 2 : d > 0.4 ? 4 : 7;
        if (whisperTimer >= freq && driftingTexts.length < 3) {
          spawnWhisper();
          whisperTimer = 0;
        }
      }

      if (d > 0.82 && Math.random() < 0.012 + (d - 0.82) * 0.05) {
        spawnWhisper();
        shakeAmount += 2 + d * 4;
      }

      // Update fish
      for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];
        fish.x += fish.vx * dt;
        fish.y += fish.vy * dt;
        fish.scaleAnim = Math.min(1, fish.scaleAnim + 3 * dt);

        if (fish.y < fish.size + 10) { fish.y = fish.size + 10; fish.vy = Math.abs(fish.vy); }
        if (fish.y > H() - 50 - fish.size) { fish.y = H() - 50 - fish.size; fish.vy = -Math.abs(fish.vy); }

        if (fish.x < -160 || fish.x > W() + 160) {
          fishes.splice(i, 1);
          continue;
        }

        // At high dread, small fish try to flee from the player
        if (d > 0.4 && fish.size < player.size * 0.7) {
          const dx = fish.x - player.x;
          const dy = fish.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist < player.size * 4) {
            fish.vx += (dx / dist) * 40 * d * dt;
            fish.vy += (dy / dist) * 30 * d * dt;
          }
        }

        const dx = fish.x - player.x;
        const dy = fish.y - player.y;
        const dist = Math.hypot(dx, dy);
        const hitRange = fish.size * 0.6 + player.size * 0.6;
        if (dist <= hitRange) {
          if (fish.size <= player.size) {
            const pts = fish.isRare ? 50 : (fish.size > player.size * 0.7 ? 15 : 10);
            score += pts;
            player.size += fish.size > player.size * 0.7 ? 1.2 : 0.5;
            eaten++;
            comboCount++;
            comboTimer = 2.5;
            spawnParticle(fish.x, fish.y, d > 0.35 ? "#8b0000" : fish.color);
            spawnBubble(fish.x, fish.y);
            spawnBubble(fish.x, fish.y);
            playEatSound();
            fishes.splice(i, 1);
            updateHud();
          } else {
            isGameOver = true;
            shakeAmount = 20;
            stopAudio();
            if (score > highScore) {
              highScore = score;
              localStorage.setItem("fishyHighScore", String(highScore));
            }
            statusEl.textContent = d > 0.5 ? "consumed" : "Game over! Tap to restart";
            break;
          }
        }
      }
    }

    // Draw entities
    drawBubbles(dt);

    const sortedFish = [...fishes].sort((a, b) => a.size - b.size);
    for (const fish of sortedFish) {
      ctx.save();
      const sa = fish.scaleAnim;
      if (sa < 1) {
        ctx.globalAlpha = sa;
        ctx.translate(fish.x, fish.y);
        ctx.scale(sa, sa);
        ctx.translate(-fish.x, -fish.y);
      }
      drawFish(fish, false);
      ctx.restore();
    }

    drawFish(player, true);
    drawParticles(dt);
    drawWhispers(dt);
    drawCombo();
    drawVignette();
    drawStatic();
    drawHallucinations(timestamp);

    // Game over overlay — changes with dread
    if (isGameOver) {
      if (d > 0.7) {
        // Horror game over
        ctx.fillStyle = `rgba(5,0,0,${0.8 + Math.sin(timestamp * 0.002) * 0.1})`;
        ctx.fillRect(0, 0, W(), H());

        const cx = W() / 2;
        const cy = H() / 2;

        // Glitchy text
        ctx.save();
        if (Math.random() < 0.1) ctx.translate(rand(-4, 4), rand(-3, 3));

        ctx.fillStyle = "#8b0000";
        ctx.textAlign = "center";
        ctx.font = "800 42px Georgia, serif";
        ctx.fillText(eaten >= 100 ? "You consumed everything." : "It consumed you.", cx, cy - 60);

        ctx.fillStyle = "#664444";
        ctx.font = "italic 20px Georgia, serif";
        ctx.fillText(`${eaten} lives ended`, cx, cy - 15);

        ctx.fillStyle = "#553333";
        ctx.font = "600 16px system-ui, sans-serif";
        ctx.fillText(`Score: ${score}  •  Size: ${Math.round(player.size)}`, cx, cy + 20);

        if (score >= highScore) {
          ctx.fillStyle = "#8b0000";
          ctx.font = "600 14px system-ui, sans-serif";
          ctx.fillText("a new record. are you proud?", cx, cy + 50);
        }

        ctx.fillStyle = "#443333";
        ctx.font = "italic 15px Georgia, serif";
        const finalMsg = pickRandom([
          "the hunger never stops",
          "you were the monster all along",
          "the ocean is quiet now",
          "nothing was worth this",
          "they all had names",
        ]);
        ctx.fillText(finalMsg, cx, cy + 85);

        ctx.fillStyle = `rgba(68,51,51,${0.4 + Math.sin(timestamp * 0.003) * 0.2})`;
        ctx.font = "400 14px system-ui, sans-serif";
        ctx.fillText("tap to forget", cx, cy + 120);

        ctx.restore();
      } else {
        // Normal game over
        ctx.fillStyle = "rgba(2, 8, 25, 0.7)";
        ctx.fillRect(0, 0, W(), H());

        const cx = W() / 2;
        const cy = H() / 2;

        const cardW = Math.min(380, W() * 0.85);
        const cardH = 260;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(100, 160, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#f8fafc";
        ctx.textAlign = "center";
        ctx.font = "800 38px system-ui, sans-serif";
        ctx.fillText("🐟 Game Over", cx, cy - 75);

        ctx.font = "700 22px system-ui, sans-serif";
        ctx.fillText(`Score: ${score}`, cx, cy - 30);

        ctx.fillStyle = "#fbbf24";
        ctx.font = "600 18px system-ui, sans-serif";
        ctx.fillText(`🏆 Best: ${highScore}`, cx, cy + 5);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 16px system-ui, sans-serif";
        ctx.fillText(`Level ${level}  •  Size ${Math.round(player.size)}`, cx, cy + 40);

        ctx.fillStyle = "#67e8f9";
        ctx.font = "600 18px system-ui, sans-serif";
        ctx.fillText("Tap or click to play again", cx, cy + 85);
      }
    }

    ctx.restore(); // pop shake
    frameId = requestAnimationFrame(step);
  }

  /* ═══════════════════════════════════════════════════════
     INPUT
     ═══════════════════════════════════════════════════════ */
  function onPointerMove(clientX, clientY) {
    pointer.x = clientX;
    pointer.y = clientY;
  }

  function onMouseMove(e) {
    onPointerMove(e.clientX, e.clientY);
  }

  function onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];
    if (t) onPointerMove(t.clientX, t.clientY);
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    if (t) onPointerMove(t.clientX, t.clientY);
    unlockAudioFromGesture();
    if (isGameOver) resetGame();
  }

  function onClick() {
    unlockAudioFromGesture();
    if (isGameOver) resetGame();
  }

  function onKeyDown() {
    unlockAudioFromGesture();
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown, { passive: true });

  window.addEventListener("resize", resize);
  resize();
  updateHud();
  frameId = requestAnimationFrame(step);

  return () => {
    isDestroyed = true;
    if (frameId) cancelAnimationFrame(frameId);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", resize);
    stopAudio();
  };
}
