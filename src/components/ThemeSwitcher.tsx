import { Landmark, Moon, Sparkles, Sun } from 'lucide-react';
import { Switch } from './ui/switch';
import { useTheme, type ThemeStyle } from '../hooks/useTheme';

/** Small inline Faravahar silhouette — the one tasteful Achaemenid accent
    (theme-spec §3). Gold, max ~28px tall, header only. */
export function FaravaharMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 28"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      {/* winged disc: central ring + three feather tiers each side + tail */}
      <circle cx="32" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="32" cy="12" r="1.4" />
      <path d="M27 10 L6 4 L9 10 L4 11 L10 14 L27 13 Z" />
      <path d="M27 13.5 L10 16 L15 19 L27 15.5 Z" />
      <path d="M37 10 L58 4 L55 10 L60 11 L54 14 L37 13 Z" />
      <path d="M37 13.5 L54 16 L49 19 L37 15.5 Z" />
      <path d="M29 17 L32 26 L35 17 Z" />
    </svg>
  );
}

const STYLE_OPTIONS: { id: ThemeStyle; label: string; Icon: typeof Landmark }[] = [
  { id: 'achaemenid', label: 'Achaemenid', Icon: Landmark },
  { id: 'modern', label: 'Modern', Icon: Sparkles },
];

export function ThemeSwitcher() {
  const { style, mode, setStyle, setMode, toggleMode } = useTheme();
  const dark = mode === 'dark';

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2">
      <div
        role="group"
        aria-label="Style"
        className="flex items-center rounded-lg border border-line-strong bg-surface p-0.5"
      >
        {STYLE_OPTIONS.map(({ id, label, Icon }) => {
          const active = style === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setStyle(id)}
              aria-pressed={active}
              className={`flex h-11 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors sm:h-[28px] ${
                active
                  ? 'bg-accent text-accent-text shadow-sm'
                  : 'text-ink hover:bg-raised hover:text-ink-strong'
              }`}
            >
              <Icon size={13} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* 44px-tall row on mobile; the switch itself is scaled up so its
          hit area grows with it, and the Sun/Moon icons are themselves
          44px buttons that set the mode directly. */}
      <div className="flex min-h-11 items-center gap-1.5 sm:min-h-0">
        <button
          type="button"
          onClick={() => setMode('light')}
          aria-label="Use light mode"
          aria-pressed={!dark}
          className="grid size-11 shrink-0 place-items-center rounded-md sm:size-6"
        >
          <Sun
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className={dark ? 'text-ink-faint' : 'text-accent'}
          />
        </button>
        <Switch
          checked={dark}
          onCheckedChange={toggleMode}
          aria-label="Toggle dark mode"
          className="max-sm:scale-150"
        />
        <button
          type="button"
          onClick={() => setMode('dark')}
          aria-label="Use dark mode"
          aria-pressed={dark}
          className="grid size-11 shrink-0 place-items-center rounded-md sm:size-6"
        >
          <Moon
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className={dark ? 'text-accent' : 'text-ink-faint'}
          />
        </button>
        <span className="sr-only">{dark ? 'Dark mode on' : 'Dark mode off'}</span>
      </div>
    </div>
  );
}
