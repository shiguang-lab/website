import { useEffect, useId, useRef, useState } from 'react';
import IconChevronDown from '@douyinfe/semi-icons/lib/es/icons/IconChevronDown';

export function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return <div className="footer-language" ref={rootRef} onKeyDown={(event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
    }
  }}>
    <button ref={triggerRef} type="button" aria-haspopup="menu" aria-expanded={open}
      aria-controls={open ? menuId : undefined} onClick={() => setOpen(!open)}>
      简体中文<IconChevronDown aria-hidden="true" className={open ? 'is-open' : undefined} />
    </button>
    {open && <div className="footer-language-panel" id={menuId} role="menu" aria-label="选择语言">
      <button className="footer-language-option" type="button" role="menuitemradio"
        aria-checked="true" autoFocus onClick={close}>简体中文</button>
    </div>}
  </div>;
}
