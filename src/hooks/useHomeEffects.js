import { useEffect } from 'react';

export function useHomeEffects() {
  useEffect(() => {
    const header = document.querySelector('[data-header]');
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');
    const tilt = document.querySelector('[data-tilt]');

    const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 18);
    const onMenuClick = () => {
      const isOpen = mobilePanel?.classList.toggle('open') ?? false;
      menuButton?.setAttribute('aria-expanded', String(isOpen));
    };
    /** @param {Event} event */
    const onPanelClick = (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        mobilePanel?.classList.remove('open');
        menuButton?.setAttribute('aria-expanded', 'false');
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    menuButton?.addEventListener('click', onMenuClick);
    mobilePanel?.addEventListener('click', onPanelClick);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

    /** @param {Event} event */
    const onTilt = (event) => {
      if (!(tilt instanceof HTMLElement) || !(event instanceof PointerEvent)) return;
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `perspective(1200px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
    };
    const resetTilt = () => {
      if (tilt instanceof HTMLElement) tilt.style.transform = '';
    };
    if (tilt && matchMedia('(pointer:fine)').matches) {
      tilt.addEventListener('pointermove', onTilt);
      tilt.addEventListener('pointerleave', resetTilt);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      menuButton?.removeEventListener('click', onMenuClick);
      mobilePanel?.removeEventListener('click', onPanelClick);
      tilt?.removeEventListener('pointermove', onTilt);
      tilt?.removeEventListener('pointerleave', resetTilt);
    };
  }, []);
}
