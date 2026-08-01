import { useEffect } from 'react';

export function useHomeEffects() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-header]');
    const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-button]');
    const mobilePanel = document.querySelector<HTMLElement>('[data-mobile-panel]');
    const tilt = document.querySelector<HTMLElement>('[data-tilt]');
    const scrollViewport = document.querySelector<HTMLElement>('.site-scrollbar [data-overlayscrollbars-contents]');

    const onScroll = () => header?.classList.toggle('scrolled', (scrollViewport?.scrollTop ?? 0) > 18);
    const onMenuClick = () => {
      const isOpen = mobilePanel?.classList.toggle('open') ?? false;
      menuButton?.setAttribute('aria-expanded', String(isOpen));
    };
    const onPanelClick = (event: Event) => {
      if (event.target instanceof HTMLAnchorElement) {
        mobilePanel?.classList.remove('open');
        menuButton?.setAttribute('aria-expanded', 'false');
      }
    };

    onScroll();
    scrollViewport?.addEventListener('scroll', onScroll, { passive: true });
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
    document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => observer.observe(element));

    const onTilt = (event: Event) => {
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
      scrollViewport?.removeEventListener('scroll', onScroll);
      menuButton?.removeEventListener('click', onMenuClick);
      mobilePanel?.removeEventListener('click', onPanelClick);
      tilt?.removeEventListener('pointermove', onTilt);
      tilt?.removeEventListener('pointerleave', resetTilt);
    };
  }, []);
}
