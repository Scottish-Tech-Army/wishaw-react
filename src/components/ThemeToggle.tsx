import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/theme-store';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}