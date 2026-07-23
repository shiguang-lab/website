(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');
  const canvas = document.querySelector('[data-stars]');

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuButton?.addEventListener('click', () => {
    const isOpen = mobilePanel.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  mobilePanel?.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      mobilePanel.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  const tilt = document.querySelector('[data-tilt]');
  if (tilt && matchMedia('(pointer:fine)').matches) {
    tilt.addEventListener('pointermove', (event) => {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      tilt.style.transform = `perspective(1200px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
    });
    tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  }

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const makeStars = () => {
    const count = Math.max(90, Math.floor(width * height / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * .72,
      r: Math.random() * 1.05 + .15,
      a: Math.random() * .7 + .15,
      s: Math.random() * .006 + .001,
      p: Math.random() * Math.PI * 2
    }));
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  };
  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      const alpha = star.a * (.72 + Math.sin(time * star.s + star.p) * .28);
      ctx.beginPath();
      ctx.fillStyle = `rgba(189, 205, 255, ${alpha})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
})();
