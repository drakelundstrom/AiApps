(function fishyGame() {
  const canvas = document.getElementById("fishy-canvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const sizeEl = document.getElementById("size");
  const statusEl = document.getElementById("status");

  const pointer = { x: 0, y: 0 };
  const player = { x: 0, y: 0, size: 20 };
  const fishes = [];
  let score = 0;
  let isGameOver = false;
  let spawnTimer = 0;
  let lastTime = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!player.x && !player.y) {
      player.x = canvas.width * 0.5;
      player.y = canvas.height * 0.5;
      pointer.x = player.x;
      pointer.y = player.y;
    }
  }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function spawnFish() {
    const fromLeft = Math.random() > 0.5;
    const size = randomInRange(8, 48);
    const speed = randomInRange(30, 110) / Math.max(size / 16, 1);
    const y = randomInRange(20, canvas.height - 20);
    fishes.push({
      x: fromLeft ? -60 : canvas.width + 60,
      y,
      vx: fromLeft ? speed : -speed,
      vy: randomInRange(-18, 18),
      size,
      color: size <= player.size ? "#7cf2b8" : "#ff7d94",
    });
  }

  function drawFish(fish, isPlayer) {
    const facingRight = fish.vx >= 0;
    const bodyColor = isPlayer ? "#ffd166" : fish.color;
    ctx.save();
    ctx.translate(fish.x, fish.y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.size, fish.size * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-fish.size, 0);
    ctx.lineTo(-fish.size - fish.size * 0.7, -fish.size * 0.35);
    ctx.lineTo(-fish.size - fish.size * 0.7, fish.size * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(fish.size * 0.45, -fish.size * 0.12, Math.max(2, fish.size * 0.12), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function resetGame() {
    player.size = 20;
    score = 0;
    fishes.length = 0;
    isGameOver = false;
    statusEl.textContent = "Move with mouse or touch";
  }

  function updateHud() {
    scoreEl.textContent = `Score: ${score}`;
    sizeEl.textContent = `Size: ${Math.round(player.size)}`;
  }

  function step(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
      const followSpeed = 6.5;
      player.x += (pointer.x - player.x) * followSpeed * dt;
      player.y += (pointer.y - player.y) * followSpeed * dt;

      spawnTimer += dt;
      if (spawnTimer >= 0.7) {
        spawnFish();
        spawnTimer = 0;
      }

      for (let i = fishes.length - 1; i >= 0; i -= 1) {
        const fish = fishes[i];
        fish.x += fish.vx * dt;
        fish.y += fish.vy * dt;

        if (fish.y < 10 || fish.y > canvas.height - 10) {
          fish.vy *= -1;
        }

        const offScreen = fish.x < -140 || fish.x > canvas.width + 140;
        if (offScreen) {
          fishes.splice(i, 1);
          continue;
        }

        const dx = fish.x - player.x;
        const dy = fish.y - player.y;
        const distance = Math.hypot(dx, dy);
        if (distance <= fish.size + player.size * 0.6) {
          if (fish.size <= player.size) {
            fishes.splice(i, 1);
            score += 10;
            player.size += 0.65;
            updateHud();
          } else {
            isGameOver = true;
            statusEl.textContent = "Game over. Tap to restart.";
            break;
          }
        }
      }
    }

    ctx.fillStyle = "#9bd0ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 22; i += 1) {
      ctx.fillStyle = "#7cc1ff";
      const x = (i * 190 + timestamp * 0.05) % (canvas.width + 220) - 110;
      const y = (i * 91) % canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    fishes.forEach((fish) => drawFish(fish, false));
    drawFish(player, true);

    if (isGameOver) {
      ctx.fillStyle = "rgba(2, 6, 23, 0.62)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8fafc";
      ctx.font = "700 42px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText("Fishy", canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = "600 24px Segoe UI";
      ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = "600 18px Segoe UI";
      ctx.fillText("Tap or click to play again", canvas.width / 2, canvas.height / 2 + 48);
    }

    requestAnimationFrame(step);
  }

  function onPointerMove(clientX, clientY) {
    pointer.x = clientX;
    pointer.y = clientY;
  }

  window.addEventListener("mousemove", (event) => onPointerMove(event.clientX, event.clientY));
  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (touch) {
        onPointerMove(touch.clientX, touch.clientY);
      }
    },
    { passive: true },
  );

  window.addEventListener("click", () => {
    if (isGameOver) {
      resetGame();
      updateHud();
    }
  });

  window.addEventListener("resize", resize);
  resize();
  updateHud();
  requestAnimationFrame(step);
})();
