import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ease } from '@/lib/motion';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>.');
  return ctx;
}

/** Notifikasi sukses/gagal. Sukses hilang sendiri (4 dtk), error lebih lama (8 dtk). */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setItems((list) => [...list.slice(-3), { id, type, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), type === 'error' ? 8000 : 4000));
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[105] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              role={t.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease } }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 border p-4 text-small',
                t.type === 'error' ? 'border-ink bg-paper text-ink' : 'border-ink bg-ink text-paper',
              )}
            >
              {t.type === 'error' ? (
                <AlertCircle size={18} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
              ) : (
                <Check size={18} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
              )}
              <p className="min-w-0 flex-1 font-medium">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi" className="-m-2 shrink-0 p-2 opacity-70 hover:opacity-100">
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
