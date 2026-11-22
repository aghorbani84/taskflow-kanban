import { useCallback, useEffect, useState } from 'react';

export type ThemeStyle = 'achaemenid' | 'modern';
export type ThemeMode = 'light' | 'dark';

const STYLE_KEY = 'showcase-style';
const MODE_KEY = 'showcase-mode';

function readStyle(): ThemeStyle {
  try {
    const v = localStorage.getItem(STYLE_KEY);
    if (v === 'achaemenid' || v === 'modern') return v;
  } catch {
    /* storage unavailable — fall through to default */
  }
  return 'modern';
}

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* storage unavailable — fall through to OS preference */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function apply(style: ThemeStyle, mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.style = style;
  root.dataset.mode = mode;
}

export function useTheme() {
  const [style, setStyleState] = useState<ThemeStyle>(readStyle);
  const [mode, setModeState] = useState<ThemeMode>(readMode);

  useEffect(() => {
    apply(style, mode);
  }, [style, mode]);

  const setStyle = useCallback((next: ThemeStyle) => {
    setStyleState(next);
    try {
      localStorage.setItem(STYLE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  return { style, mode, setStyle, setMode, toggleMode };
}
