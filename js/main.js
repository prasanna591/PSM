// =========================================================
// PSM — Shared behavior: navbar, reveals, counters
// =========================================================

(function () {
  // ---------- Dynamic Island Navbar ----------
  const nav = document.querySelector('.island-nav');
  const toggle = document.querySelector('.island-nav__toggle');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      if (window.innerWidth > 900 && y > lastY && y > 120) {
        nav.classList.add('is-hidden');
        nav.classList.remove('is-open');
      } else {
        nav.classList.remove('is-hidden');
      }
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  // Tap island while collapsed (mobile) reveals it if hidden
  if (nav) {
    nav.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && nav.classList.contains('is-hidden')) {
        nav.classList.remove('is-hidden');
      }
    });
  }

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Animated counters ----------
  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  }

  // ---------- Mouse parallax for elements with [data-parallax] ----------
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      parallaxEls.forEach((el) => {
        const strength = parseFloat(el.dataset.parallax) || 12;
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
    }, { passive: true });
  }
})();
