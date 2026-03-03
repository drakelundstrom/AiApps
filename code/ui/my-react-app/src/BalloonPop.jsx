import { useEffect, useRef, useState, useCallback } from 'react';

/* ──────────────────  Audio helpers (Web Audio API)  ────────────────── */

function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

/** Play a short "pop" sound with randomised pitch */
function playPop(ctx) {
  const now = ctx.currentTime;
  // White-noise burst
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Band-pass to give it a "pop" quality
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800 + Math.random() * 1200;
  filter.Q.value = 1.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.08);

  // Tonal ping
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600 + Math.random() * 800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.3, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

/** Start a cheerful looping melody using oscillators */
function startMusic(ctx) {
  // C-major pentatonic melody notes (MIDI → Hz)
  const melodyNotes = [
    60, 64, 67, 72, 76, 72, 67, 64, // C E G C5 E5 C5 G E
    62, 65, 69, 74, 77, 74, 69, 65, // D F A D5 F5 D5 A F
    60, 64, 67, 71, 72, 71, 67, 64, // C E G B C5 B G E
  ];
  const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const noteDuration = 0.3;
  const loopLen = melodyNotes.length * noteDuration;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.12;
  masterGain.connect(ctx.destination);

  let stopped = false;

  function scheduleLoop(startTime) {
    if (stopped) return;
    melodyNotes.forEach((note, i) => {
      if (stopped) return;
      const t = startTime + i * noteDuration;

      // Melody voice
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = midiToHz(note);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 0.9);
      osc.connect(g).connect(masterGain);
      osc.start(t);
      osc.stop(t + noteDuration);

      // Simple bass (root of each bar, every 8 notes)
      if (i % 8 === 0) {
        const bass = ctx.createOscillator();
        bass.type = 'sine';
        bass.frequency.value = midiToHz(note - 24);
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.6, t);
        bg.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 7.5);
        bass.connect(bg).connect(masterGain);
        bass.start(t);
        bass.stop(t + noteDuration * 8);
      }
    });
    // Schedule the next loop well before this one ends
    setTimeout(() => scheduleLoop(startTime + loopLen), (loopLen - 1) * 1000);
  }

  scheduleLoop(ctx.currentTime + 0.1);

  return () => { stopped = true; masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); };
}

/* ──────────────────  Balloon helpers  ────────────────── */

const BALLOON_COLORS = [
  '#FF6B6B', '#FF8E53', '#FECA57', '#48DBFB', '#FF9FF3',
  '#54E346', '#7D5FFF', '#F368E0', '#00D2D3', '#FF6348',
  '#FFA502', '#2ED573', '#1E90FF', '#FF4757', '#ECCC68',
];

const BALLOON_EMOJIS = ['🎈', '🎈', '🎈', '⭐', '🌟', '💜', '💛', '💚', '❤️', '🩵'];

let nextId = 0;
function makeBalloon(areaW, areaH) {
  const size = 50 + Math.random() * 50;
  return {
    id: nextId++,
    x: Math.random() * (areaW - size),
    y: areaH + size, // start below screen
    size,
    speed: 0.6 + Math.random() * 1.4,
    wobbleAmp: 15 + Math.random() * 25,
    wobbleSpeed: 0.5 + Math.random() * 1.5,
    wobbleOffset: Math.random() * Math.PI * 2,
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    emoji: BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)],
    popping: false,
    popTime: 0,
  };
}

/* ──────────────────  Component  ────────────────── */

export default function BalloonPop() {
  const canvasRef = useRef(null);
  const balloonsRef = useRef([]);
  const poppedParticlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const stopMusicRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const sizeRef = useRef({ w: 800, h: 600 });
  const lastSpawnRef = useRef(0);

  /* Resize handler */
  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    sizeRef.current = { w, h, dpr };
  }, []);

  /* Start the experience */
  const handleStart = useCallback(() => {
    const ctx = createAudioContext();
    audioCtxRef.current = ctx;
    stopMusicRef.current = startMusic(ctx);
    setStarted(true);

    // Seed initial balloons
    const { w, h } = sizeRef.current;
    balloonsRef.current = [];
    for (let i = 0; i < 12; i++) {
      const b = makeBalloon(w, h);
      b.y = Math.random() * h; // spread them out
      balloonsRef.current.push(b);
    }
  }, []);

  /* Pop handling */
  const handleInteraction = useCallback((clientX, clientY) => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let popped = false;
    balloonsRef.current.forEach((b) => {
      if (b.popping) return;
      const bx = b.x + b.size / 2;
      const by = b.y + b.size / 2;
      const dist = Math.hypot(x - bx, y - by);
      if (dist < b.size * 0.6) {
        b.popping = true;
        b.popTime = performance.now();
        popped = true;

        // Spawn particles
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          poppedParticlesRef.current.push({
            x: bx, y: by,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3),
            size: 4 + Math.random() * 6,
            color: b.color,
            life: 1,
          });
        }
      }
    });

    if (popped && audioCtxRef.current) {
      playPop(audioCtxRef.current);
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
  }, [started]);

  const onPointerDown = useCallback((e) => {
    // Handle all touches for multi-touch
    if (e.touches) {
      for (let i = 0; i < e.touches.length; i++) {
        handleInteraction(e.touches[i].clientX, e.touches[i].clientY);
      }
    } else {
      handleInteraction(e.clientX, e.clientY);
    }
  }, [handleInteraction]);

  /* Animation loop */
  useEffect(() => {
    if (!started) return;
    updateSize();
    window.addEventListener('resize', updateSize);

    let prevTime = performance.now();

    function loop(now) {
      const dt = Math.min((now - prevTime) / 16.67, 3); // normalise to ~60fps
      prevTime = now;
      const { w, h, dpr } = sizeRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f0c29');
      grad.addColorStop(0.5, '#302b63');
      grad.addColorStop(1, '#24243e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw twinkling stars
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 97.3) % h);
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(now * 0.001 + i));
        ctx.globalAlpha = twinkle * 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Spawn new balloons
      if (now - lastSpawnRef.current > 800) {
        balloonsRef.current.push(makeBalloon(w, h));
        lastSpawnRef.current = now;
      }

      // Update & draw balloons
      const activeBalloons = [];
      for (const b of balloonsRef.current) {
        if (b.popping) {
          if (now - b.popTime > 300) continue; // remove after anim
          // Pop animation: scale down + fade
          const t = (now - b.popTime) / 300;
          ctx.globalAlpha = 1 - t;
          ctx.font = `${b.size * (1 + t * 0.5)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.emoji, b.x + b.size / 2, b.y + b.size / 2);
          ctx.globalAlpha = 1;
          activeBalloons.push(b);
          continue;
        }

        b.y -= b.speed * dt;
        const wobble = Math.sin(now * 0.001 * b.wobbleSpeed + b.wobbleOffset) * b.wobbleAmp * 0.05 * dt;
        b.x += wobble;

        // Keep in bounds horizontally
        if (b.x < -b.size) b.x = w;
        if (b.x > w) b.x = -b.size;

        // If balloon goes above screen, recycle it
        if (b.y < -b.size * 2) {
          b.y = h + b.size;
          b.x = Math.random() * (w - b.size);
          b.speed = 0.6 + Math.random() * 1.4;
        }

        // Draw balloon
        const cx = b.x + b.size / 2;
        const cy = b.y + b.size / 2;

        // Glow effect
        const glow = ctx.createRadialGradient(cx, cy, b.size * 0.1, cx, cy, b.size * 0.8);
        glow.addColorStop(0, b.color + 'CC');
        glow.addColorStop(1, b.color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, b.size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Balloon emoji
        ctx.font = `${b.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Subtle bounce
        const bounce = Math.sin(now * 0.003 + b.wobbleOffset) * 3;
        ctx.fillText(b.emoji, cx, cy + bounce);

        // String
        ctx.strokeStyle = b.color + '88';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy + b.size * 0.45);
        ctx.quadraticCurveTo(cx + Math.sin(now * 0.002 + b.wobbleOffset) * 5, cy + b.size * 0.7, cx, cy + b.size * 0.9);
        ctx.stroke();

        activeBalloons.push(b);
      }
      balloonsRef.current = activeBalloons;

      // Update & draw particles
      const liveParticles = [];
      for (const p of poppedParticlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.1 * dt; // gravity
        p.life -= 0.02 * dt;
        if (p.life <= 0) continue;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        liveParticles.push(p);
      }
      poppedParticlesRef.current = liveParticles;
      ctx.globalAlpha = 1;

      // Score display
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`🎈 ${scoreRef.current}`, 16, 16);

      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, [started, updateSize]);

  /* Cleanup audio on unmount */
  useEffect(() => {
    return () => {
      if (stopMusicRef.current) stopMusicRef.current();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        onClick={onPointerDown}
        onTouchStart={(e) => { e.preventDefault(); onPointerDown(e); }}
      />
      {!started && (
        <div style={styles.overlay} onClick={handleStart} onTouchStart={(e) => { e.preventDefault(); handleStart(); }}>
          <div style={styles.startCard}>
            <div style={styles.startEmoji}>🎈🐱🐶👶</div>
            <h1 style={styles.title}>Balloon Pop!</h1>
            <p style={styles.subtitle}>
              Distract your cat, dog, or baby!<br />
              Tap the balloons to pop them!
            </p>
            <button style={styles.startButton}>
              ▶ Tap to Start
            </button>
            <p style={styles.hint}>🔊 Music & sound effects will play</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────  Styles  ────────────────── */

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    overflow: 'hidden',
    background: '#0f0c29',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    cursor: 'pointer',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(15, 12, 41, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 10,
    cursor: 'pointer',
  },
  startCard: {
    textAlign: 'center',
    padding: '2.5rem 3rem',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    maxWidth: '400px',
  },
  startEmoji: {
    fontSize: '3.5rem',
    marginBottom: '0.5rem',
    lineHeight: 1.2,
  },
  title: {
    color: '#fff',
    fontSize: '2.4rem',
    fontWeight: 800,
    margin: '0.25rem 0',
    background: 'linear-gradient(135deg, #FF6B6B, #FECA57, #48DBFB, #FF9FF3)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '1.1rem',
    lineHeight: 1.5,
    margin: '0.75rem 0 1.5rem',
  },
  startButton: {
    background: 'linear-gradient(135deg, #FF6B6B, #FF9FF3)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '1rem 2.5rem',
    fontSize: '1.3rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(255,107,107,0.4)',
    transition: 'transform 0.15s',
    pointerEvents: 'none', // parent handles click
  },
  hint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.85rem',
    marginTop: '1rem',
  },
};
