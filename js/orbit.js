// =========================================================
// PSM — Orbit System (canvas)
// Three nodes (Solutions/Lab/Edits) orbiting a shared core,
// connected by live lines — the ecosystem visualized.
// =========================================================

(function () {
  const canvas = document.getElementById('orbit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, dpr;
  let particles = [];

  const colors = {
    blue: '#0D6EFD',
    green: '#16A34A',
    purple: '#7C3AED',
  };

  const nodes = [
    { label: 'PSM Solutions', color: colors.blue, radiusFactor: 0.34, speed: 0.00032, angle: 0, size: 9 },
    { label: 'PSM Lab', color: colors.green, radiusFactor: 0.46, speed: -0.00022, angle: 2.1, size: 9 },
    { label: 'PSM Edits', color: colors.purple, radiusFactor: 0.40, speed: 0.00026, angle: 4.2, size: 9 },
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // seed floating particles
    particles = [];
    const count = Math.floor((w * h) / 26000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        a: Math.random() * 0.5 + 0.15,
      });
    }
  }

  function hexToRgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  let frame = 0;
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(t) {
    frame++;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h);

    // floating particles (subtle)
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(183, 195, 214, ${p.a * 0.5})`;
      ctx.fill();
    });

    // core node
    const coreR = 14;
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 4);
    coreGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
    coreGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 4, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    const positions = [];

    nodes.forEach((n) => {
      if (!reduced) n.angle += n.speed * 16.7;
      const r = baseRadius * n.radiusFactor;
      const x = cx + Math.cos(n.angle) * r;
      const y = cy + Math.sin(n.angle) * r * 0.62; // elliptical orbit
      positions.push({ x, y, color: n.color, size: n.size });

      // orbit path (faint ellipse)
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(183,195,214,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // connecting line to core
      const [cr, cg, cb] = hexToRgb(n.color);
      const grad = ctx.createLinearGradient(cx, cy, x, y);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0.55)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, n.size * 5);
      glow.addColorStop(0, `rgba(${cr},${cg},${cb},0.55)`);
      glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.beginPath();
      ctx.arc(x, y, n.size * 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // node
      ctx.beginPath();
      ctx.arc(x, y, n.size, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, n.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });

    // connect nodes to each other (faint triangle)
    ctx.beginPath();
    ctx.moveTo(positions[0].x, positions[0].y);
    ctx.lineTo(positions[1].x, positions[1].y);
    ctx.lineTo(positions[2].x, positions[2].y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(183,195,214,0.10)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (!reduced) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
  if (reduced) draw(0); // draw one static frame
})();
