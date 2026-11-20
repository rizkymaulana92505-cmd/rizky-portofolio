import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Perilaku dialog: kunci scroll halaman, tutup dengan Esc, jebak fokus (Tab),
 * fokus awal ke `initialFocusRef`, dan kembalikan fokus ke pemicu saat ditutup.
 */
export function useDialog({ open, onClose, panelRef, initialFocusRef }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const trigger = document.activeElement;
    const { body } = document;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    if (initialFocusRef?.current) initialFocusRef.current.focus();
    else panelRef?.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
      trigger?.focus?.();
    };
  }, [open, panelRef, initialFocusRef]);
}
