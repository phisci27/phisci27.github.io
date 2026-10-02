const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const nav = document.querySelector('[data-nav]');
const canvas = document.querySelector('[data-science-canvas]');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 30);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menu.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

const context = canvas.getContext('2d');
const pointer = { x: -999, y: -999, active: false };
let particles = [];
let frame = 0;
let width = 0;
let height = 0;
let pixelRatio = 1;

const palette = ['#d8ff3e', '#ff684d', '#4ce2e8', '#ffffff'];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  makeParticles();
}

function makeParticles() {
  const count = Math.min(86, Math.max(34, Math.round(width / 17)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - .5) * .22,
    vy: (Math.random() - .5) * .22,
    radius: index % 11 === 0 ? 4.2 : index % 5 === 0 ? 2.8 : 1.7,
    color: palette[index % palette.length],
    phase: Math.random() * Math.PI * 2
  }));
}

function draw(animate = true) {
  context.clearRect(0, 0, width, height);
  const maxDistance = width < 700 ? 105 : 145;

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;
    if (particle.y < -10) particle.y = height + 10;
    if (particle.y > height + 10) particle.y = -10;

    if (pointer.active) {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 160 && distance > 0) {
        particle.x -= (dx / distance) * (160 - distance) * .006;
        particle.y -= (dy / distance) * (160 - distance) * .006;
      }
    }

    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
      const other = particles[otherIndex];
      const distance = Math.hypot(other.x - particle.x, other.y - particle.y);
      if (distance < maxDistance) {
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(255,255,255,${(1 - distance / maxDistance) * .13})`;
        context.lineWidth = .7;
        context.stroke();
      }
    }

    const pulse = 1 + Math.sin(frame * .012 + particle.phase) * .12;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
    context.fillStyle = particle.color;
    context.globalAlpha = particle.radius > 3 ? .88 : .62;
    context.fill();
    context.globalAlpha = 1;
  });

  frame += 1;
  if (animate) requestAnimationFrame(draw);
}

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
  pointer.active = true;
});
canvas.addEventListener('pointerleave', () => { pointer.active = false; });
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
draw(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
