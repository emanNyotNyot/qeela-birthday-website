const heartsCanvas = document.getElementById('hearts');
const confettiCanvas = document.getElementById('confetti');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const sparkleBtn = document.getElementById('sparkleBtn');
const againBtn = document.getElementById('againBtn');

const heartsCtx = heartsCanvas.getContext('2d');
const confettiCtx = confettiCanvas.getContext('2d');


function resizeCanvas(canvas, ctx) {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas(heartsCanvas, heartsCtx);
resizeCanvas(confettiCanvas, confettiCtx);
window.addEventListener('resize', () => {
  resizeCanvas(heartsCanvas, heartsCtx);
  resizeCanvas(confettiCanvas, confettiCtx);
});

let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Hearts
const hearts = [];
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnHeart(x, y) {
  const speed = rand(0.4, 1.2);
  hearts.push({
    x,
    y,
    vx: rand(-0.4, 0.4),
    vy: rand(-2.2, -0.8) * speed,
    r: rand(5, 10),
    a: rand(0.35, 0.9),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.08, 0.08),
    life: 0,
    ttl: rand(60, 120),
    hue: rand(330, 360)
  });
}

function heartPath(ctx, size) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.25);
  ctx.bezierCurveTo(0, 0, s * 0.5, 0, s * 0.5, s * 0.25);
  ctx.bezierCurveTo(s * 0.5, 0, s, 0, s, s * 0.25);
  ctx.bezierCurveTo(s, s * 0.6, s * 0.65, s * 0.85, s * 0.5, s);
  ctx.bezierCurveTo(s * 0.35, s * 0.85, 0, s * 0.6, 0, s * 0.25);
  ctx.closePath();
}

let last = performance.now();
function animateHearts(t) {
  const dt = Math.min(33, t - last);
  last = t;

  heartsCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // occasional spawn around mouse
  if (Math.random() < 0.25) {
    spawnHeart(mouse.x + rand(-40, 40), mouse.y + rand(-30, 30));
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.life += dt;
    h.x += h.vx * (dt / 16);
    h.y += h.vy * (dt / 16);
    h.rot += h.vr * (dt / 16);

    const fade = Math.max(0, 1 - h.life / h.ttl);
    heartsCtx.save();
    heartsCtx.translate(h.x, h.y);
    heartsCtx.rotate(h.rot);
    heartsCtx.globalAlpha = h.a * fade;
    heartsCtx.fillStyle = `hsla(${h.hue}, 100%, 70%, 1)`;
    heartPath(heartsCtx, h.r);
    heartsCtx.fill();
    heartsCtx.restore();

    if (h.life >= h.ttl) hearts.splice(i, 1);
  }

  requestAnimationFrame(animateHearts);
}
requestAnimationFrame(animateHearts);

// Confetti (simple pink sparkles)
const confetti = [];
function spawnConfettiBurst() {
  const count = 140;
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: mouse.x + rand(-20, 20),
      y: mouse.y + rand(-10, 10),
      vx: rand(-4, 4),
      vy: rand(-8, -2),
      w: rand(4, 9),
      h: rand(6, 12),
      rot: rand(0, Math.PI),
      vr: rand(-0.15, 0.15),
      life: 0,
      ttl: rand(45, 90),
      col: `rgba(255, 122, 182, ${rand(0.6, 1).toFixed(2)})`
    });
  }
}

function animateConfetti(t) {
  confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.life += 16;
    c.vy += 0.22;
    c.x += c.vx;
    c.y += c.vy;
    c.rot += c.vr;

    const fade = Math.max(0, 1 - c.life / c.ttl);

    confettiCtx.save();
    confettiCtx.translate(c.x, c.y);
    confettiCtx.rotate(c.rot);
    confettiCtx.globalAlpha = fade;
    confettiCtx.fillStyle = c.col;
    confettiCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    confettiCtx.restore();

    if (c.life >= c.ttl) confetti.splice(i, 1);
  }

  requestAnimationFrame(animateConfetti);
}
requestAnimationFrame(animateConfetti);

// UI
const mainCard = document.getElementById('main');
const successCard = document.getElementById('success');

function showSuccess() {
  mainCard.style.display = 'none';
  successCard.style.display = 'block';
  spawnConfettiBurst();
}

function moveNoButton() {
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  // Keep inside viewport with margin
  const margin = 20;
  const x = rand(margin, window.innerWidth - bw - margin);
  const y = rand(margin + 60, window.innerHeight - bh - margin);

  noBtn.style.position = 'fixed';
  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';
}

yesBtn?.addEventListener('click', showSuccess);
noBtn?.addEventListener('mouseover', moveNoButton);

sparkleBtn?.addEventListener('click', () => {
  spawnConfettiBurst();
  // extra hearts
  for (let i = 0; i < 18; i++) spawnHeart(mouse.x + rand(-60, 60), mouse.y + rand(-40, 40));
});

againBtn?.addEventListener('click', () => {
  successCard.style.display = 'none';
  mainCard.style.display = 'block';
  // reset no button position
  noBtn.style.position = 'relative';
  noBtn.style.left = '';
  noBtn.style.top = '';
  confetti.length = 0;
});

// Polaroid drag
let drag = null;
const polaroids = Array.from(document.querySelectorAll('.polaroid'));

polaroids.forEach((p) => {
  p.style.cursor = 'grab';

  p.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    p.setPointerCapture?.(e.pointerId);
    drag = {
      el: p,
      ox: e.clientX,
      oy: e.clientY,
      startX: p.getBoundingClientRect().left,
      startY: p.getBoundingClientRect().top
    };
    p.style.cursor = 'grabbing';
    // bring to front
    p.style.zIndex = 20;
  });
});

document.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.ox;
  const dy = e.clientY - drag.oy;

  drag.el.style.position = 'fixed';
  drag.el.style.left = drag.startX + dx + 'px';
  drag.el.style.top = drag.startY + dy + 'px';

  // tiny hearts on drag
  if (Math.random() < 0.15) spawnHeart(e.clientX, e.clientY);
});

document.addEventListener('pointerup', () => {
  if (!drag) return;
  drag.el.style.cursor = 'grab';
  drag.el.style.zIndex = '';
  drag = null;
});

