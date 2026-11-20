import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

export default function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      aria-pressed={dark}
      title={dark ? 'Mode terang' : 'Mode gelap'}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center border border-ink transition-colors duration-300 ease-editorial hover:bg-ink hover:text-paper',
        className,
      )}
    >
      {dark ? <Sun size={18} strokeWidth={1.5} aria-hidden /> : <Moon size={18} strokeWidth={1.5} aria-hidden />}
    </button>
  );
}
