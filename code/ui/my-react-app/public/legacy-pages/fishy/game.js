(function fishyGame() {
  const canvas = document.getElementById("fishy-canvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const sizeEl = document.getElementById("size");
  const statusEl = document.getElementById("status");
  const levelEl = document.getElementById("level-bar");

  /* ── state ── */
  const pointer = { x: 0, y: 0 };
  const player = { x: 0, y: 0, size: 20, vx: 0 };
  const fishes = [];
  const bubbles = [];
  const particles = [];
  const seaweeds = [];
  let score = 0;
  let level = 1;
  let isGameOver = false;
  let spawnTimer = 0;
  let lastTime = 0;
  let comboCount = 0;
  let comboTimer = 0;
  let shakeAmount = 0;
  let highScore = parseInt(localStorage.getItem("fishyHighScore") || "0", 10);

  /* ── fish color palettes by type ── */
  const FISH_PALETTES = {
    small: ["#7cf2b8", "#6ee7b7", "#34d399", "#5eead4", "#67e8f9", "#a7f3d0"],
    medium: ["#fbbf24", "#f59e0b", "#fb923c", "#fdba74"],
    danger: ["#ff7d94", "#f87171", "#fb7185", "#ef4444", "#e11d48"],
    rare: ["#c084fc", "#a78bfa", "#818cf8", "#e879f9"],
  };

  /* ── seaweed generation ── */
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

  /* ── resize ── */
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

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ── level thresholds ── */
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
    return Math.max(0.18, 0.6 - level * 0.05);
  }

  function getMaxFishSize() {
    return 30 + level * 10;
  }

  /* ── spawn ── */
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
      y,
      vx: fromLeft ? speed : -speed,
      vy: rand(-22, 22),
      size,
      color: pickRandom(palette),
      isRare,
      scaleAnim: 0,
      pattern: Math.floor(Math.random() * 3), // 0=normal, 1=striped, 2=spotted
    });
  }

  function spawnBubble(x, y) {
    bubbles.push({
      x: x + rand(-10, 10),
      y,
      r: rand(2, 7),
      speed: rand(20, 60),
      wobble: rand(0, Math.PI * 2),
      alpha: rand(0.3, 0.7),
    });
  }

  function spawnParticle(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      particles.push({
        x, y,
        vx: Math.cos(angle) * rand(30, 80),
        vy: Math.sin(angle) * rand(30, 80),
        r: rand(2, 5),
        color,
        life: 1,
      });
    }
  }

  /* ── drawings ── */

  function drawBackground(timestamp) {
    // Ocean gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H());
    grad.addColorStop(0, "#1a8fc4");
    grad.addColorStop(0.3, "#1578a8");
    grad.addColorStop(0.7, "#0d5f8a");
    grad.addColorStop(1, "#062a45");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W(), H());

    // Light rays from top
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 7; i++) {
      const rayX = (i * W() / 6) + Math.sin(timestamp * 0.0003 + i) * 40;
      const rayW = 30 + Math.sin(timestamp * 0.0005 + i * 2) * 15;
      const gradient = ctx.createLinearGradient(rayX, 0, rayX, H() * 0.8);
      gradient.addColorStop(0, "#fffbe6");
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

    // Floating caustic circles
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 30; i++) {
      const cx = ((i * 173.7 + timestamp * 0.02) % (W() + 100)) - 50;
      const cy = ((i * 113.3 + timestamp * 0.015) % (H() + 100)) - 50;
      const r = 10 + Math.sin(timestamp * 0.001 + i) * 6;
      ctx.fillStyle = "#8dd8f8";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Sandy bottom
    const sandY = H() - 40;
    const sandGrad = ctx.createLinearGradient(0, sandY, 0, H());
    sandGrad.addColorStop(0, "#c2956a");
    sandGrad.addColorStop(0.3, "#b5864f");
    sandGrad.addColorStop(1, "#8b6a3e");
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, sandY);
    for (let x = 0; x <= W(); x += 20) {
      ctx.lineTo(x, sandY + Math.sin(x * 0.02 + timestamp * 0.001) * 6);
    }
    ctx.lineTo(W(), H());
    ctx.lineTo(0, H());
    ctx.closePath();
    ctx.fill();

    // Small pebbles on sand
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
      const px = (i * 137 + 50) % W();
      const py = sandY + 10 + (i * 7) % 20;
      ctx.fillStyle = i % 3 === 0 ? "#9a7d5a" : "#a8916e";
      ctx.beginPath();
      ctx.ellipse(px, py, 3 + (i % 4), 2 + (i % 3), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSeaweed(timestamp) {
    for (const sw of seaweeds) {
      ctx.save();
      ctx.fillStyle = sw.color;
      ctx.globalAlpha = 0.6;
      const baseY = H() - 35;
      let prevX = sw.x;
      let prevY = baseY;
      const segH = sw.height / sw.segments;

      for (let s = 0; s < sw.segments; s++) {
        const sway = Math.sin(timestamp * 0.001 + sw.phase + s * 0.5) * (8 + s * 3);
        const cx = sw.x + sway;
        const cy = baseY - (s + 1) * segH;
        const w = sw.width * (1 - s / sw.segments * 0.6);

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

  function drawFish(fish, isPlayer) {
    const facingRight = isPlayer ? (pointer.x >= player.x) : (fish.vx >= 0);
    ctx.save();
    ctx.translate(fish.x, fish.y);
    if (!facingRight) ctx.scale(-1, 1);

    const s = fish.size;
    const bodyColor = isPlayer ? "#ffd166" : fish.color;

    // Shadow/glow under fish
    if (isPlayer) {
      ctx.shadowColor = "#ffd16688";
      ctx.shadowBlur = 15;
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

    // Pattern decorations
    if (!isPlayer && fish.pattern === 1) {
      // Stripes
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = Math.max(1, s * 0.06);
      for (let i = -2; i <= 2; i++) {
        const sx = i * s * 0.2;
        ctx.beginPath();
        ctx.moveTo(sx, -s * 0.4);
        ctx.lineTo(sx, s * 0.4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (!isPlayer && fish.pattern === 2) {
      // Spots
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 3; i++) {
        const sx = -s * 0.3 + i * s * 0.3;
        const sy = (i % 2 === 0 ? -1 : 1) * s * 0.15;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1.5, s * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Lighter belly
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.12, s * 0.7, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dorsal fin
    ctx.fillStyle = isPlayer ? "#f0b429" : fish.color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.9, s * 0.4, -s * 0.45);
    ctx.lineTo(-s * 0.1, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Tail
    ctx.fillStyle = isPlayer ? "#f0b429" : bodyColor;
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(-s - s * 0.75, -s * 0.4);
    ctx.quadraticCurveTo(-s - s * 0.5, 0, -s - s * 0.75, s * 0.4);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.4, -s * 0.1, Math.max(2.5, s * 0.16), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(s * 0.45, -s * 0.1, Math.max(1.5, s * 0.09), 0, Math.PI * 2);
    ctx.fill();
    // Eye highlight
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.48, -s * 0.15, Math.max(0.8, s * 0.04), 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = Math.max(1, s * 0.04);
    ctx.beginPath();
    ctx.arc(s * 0.65, s * 0.05, Math.max(2, s * 0.1), -0.3, 0.6);
    ctx.stroke();

    // Player crown indicator
    if (isPlayer && player.size >= 40) {
      ctx.fillStyle = "#fbbf24";
      ctx.globalAlpha = 0.9;
      ctx.font = `${Math.min(s * 0.5, 24)}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("👑", 0, -s * 0.65);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawBubbles(dt) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.speed * dt;
      b.x += Math.sin(b.wobble) * 0.4;
      b.wobble += 2 * dt;
      b.alpha -= 0.12 * dt;
      if (b.alpha <= 0 || b.y < -20) { bubbles.splice(i, 1); continue; }
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = "#cceeff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
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

  function drawCombo() {
    if (comboCount < 2 || comboTimer <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, comboTimer);
    ctx.fillStyle = comboCount >= 5 ? "#fbbf24" : comboCount >= 3 ? "#fb923c" : "#67e8f9";
    ctx.font = `800 ${Math.min(28 + comboCount * 3, 52)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const bounce = Math.sin(Date.now() * 0.01) * 4;
    ctx.fillText(
      comboCount >= 5 ? `🔥 ${comboCount}x COMBO!` : `${comboCount}x Combo!`,
      W() / 2,
      80 + bounce
    );
    ctx.restore();
  }

  /* ── game logic ── */

  function resetGame() {
    player.size = 20;
    player.x = W() * 0.5;
    player.y = H() * 0.5;
    pointer.x = player.x;
    pointer.y = player.y;
    score = 0;
    level = 1;
    comboCount = 0;
    comboTimer = 0;
    fishes.length = 0;
    bubbles.length = 0;
    particles.length = 0;
    isGameOver = false;
    statusEl.textContent = "Move with mouse or touch";
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = `🏆 ${score}`;
    sizeEl.textContent = `🐟 ${Math.round(player.size)}`;
    const newLevel = getLevel();
    if (newLevel !== level) {
      level = newLevel;
      shakeAmount = 8;
    }
    levelEl.textContent = `⭐ Level ${level}`;
  }

  /* ── main loop ── */

  function step(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.04);
    lastTime = timestamp;

    // Screen shake
    ctx.save();
    if (shakeAmount > 0.5) {
      ctx.translate(rand(-shakeAmount, shakeAmount), rand(-shakeAmount, shakeAmount));
      shakeAmount *= 0.9;
    } else {
      shakeAmount = 0;
    }

    // Draw background layers
    drawBackground(timestamp);
    drawSeaweed(timestamp);

    if (!isGameOver) {
      // Player follow
      const followSpeed = 7;
      const prevX = player.x;
      player.x += (pointer.x - player.x) * followSpeed * dt;
      player.y += (pointer.y - player.y) * followSpeed * dt;
      player.vx = player.x - prevX;

      // Clamp to screen
      player.x = Math.max(player.size, Math.min(W() - player.size, player.x));
      player.y = Math.max(player.size, Math.min(H() - player.size, player.y));

      // Player bubbles
      if (Math.random() < 0.15) {
        spawnBubble(player.x - player.size * 0.8, player.y);
      }

      // Spawn fish
      spawnTimer += dt;
      if (spawnTimer >= getSpawnInterval()) {
        const count = level >= 5 ? 2 : 1;
        for (let i = 0; i < count; i++) spawnFish();
        spawnTimer = 0;
      }

      // Combo decay
      comboTimer -= dt;
      if (comboTimer <= 0) {
        comboCount = 0;
      }

      // Update fish colors based on current player size
      for (const fish of fishes) {
        if (!fish.isRare) {
          if (fish.size <= player.size * 0.5) {
            fish.color = pickRandom(FISH_PALETTES.small);
          } else if (fish.size <= player.size) {
            fish.color = pickRandom(FISH_PALETTES.medium);
          } else {
            fish.color = pickRandom(FISH_PALETTES.danger);
          }
        }
      }

      // Update fish
      for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];
        fish.x += fish.vx * dt;
        fish.y += fish.vy * dt;
        fish.scaleAnim = Math.min(1, fish.scaleAnim + 3 * dt);

        // Bounce off top/bottom
        if (fish.y < fish.size + 10) { fish.y = fish.size + 10; fish.vy = Math.abs(fish.vy); }
        if (fish.y > H() - 50 - fish.size) { fish.y = H() - 50 - fish.size; fish.vy = -Math.abs(fish.vy); }

        // Remove off-screen
        if (fish.x < -160 || fish.x > W() + 160) {
          fishes.splice(i, 1);
          continue;
        }

        // Collision
        const dx = fish.x - player.x;
        const dy = fish.y - player.y;
        const dist = Math.hypot(dx, dy);
        const hitRange = fish.size * 0.6 + player.size * 0.6;
        if (dist <= hitRange) {
          if (fish.size <= player.size) {
            const pts = fish.isRare ? 50 : (fish.size > player.size * 0.7 ? 15 : 10);
            score += pts;
            player.size += fish.size > player.size * 0.7 ? 1.2 : 0.5;
            comboCount++;
            comboTimer = 2.5;
            spawnParticle(fish.x, fish.y, fish.color);
            spawnBubble(fish.x, fish.y);
            spawnBubble(fish.x, fish.y);
            fishes.splice(i, 1);
            updateHud();
          } else {
            isGameOver = true;
            shakeAmount = 20;
            if (score > highScore) {
              highScore = score;
              localStorage.setItem("fishyHighScore", String(highScore));
            }
            statusEl.textContent = "Game over! Tap to restart";
            break;
          }
        }
      }
    }

    // Draw entities
    drawBubbles(dt);

    // Draw fish (smaller ones behind, larger in front)
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
    drawCombo();

    // Game over overlay
    if (isGameOver) {
      ctx.fillStyle = "rgba(2, 8, 25, 0.7)";
      ctx.fillRect(0, 0, W(), H());

      const cx = W() / 2;
      const cy = H() / 2;

      // Card background
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

    ctx.restore(); // pop shake transform
    requestAnimationFrame(step);
  }

  /* ── input ── */

  function onPointerMove(clientX, clientY) {
    pointer.x = clientX;
    pointer.y = clientY;
  }

  window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (t) onPointerMove(t.clientX, t.clientY);
  }, { passive: false });

  // Keep pointer in sync on touch start too
  window.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (t) onPointerMove(t.clientX, t.clientY);
    if (isGameOver) { resetGame(); }
  }, { passive: true });

  window.addEventListener("click", () => {
    if (isGameOver) { resetGame(); }
  });

  window.addEventListener("resize", resize);
  resize();
  updateHud();
  requestAnimationFrame(step);
})();
