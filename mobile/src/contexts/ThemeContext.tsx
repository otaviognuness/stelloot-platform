import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getStoredValue, setStoredValue } from '@/src/storage/storage';
import { Palette, palettes, ThemeMode } from '@/src/theme/colors';

const THEME_KEY = 'stelloot.mobile.theme';

type ThemeContextValue = {
  colors: Palette;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function StelLootThemeProvider({ children }: PropsWithChildren) {
  const [mode, setThemeMode] = useState<ThemeMode>('default');

  useEffect(() => {
    getStoredValue(THEME_KEY).then((storedTheme) => {
      if (storedTheme === 'default' || storedTheme === 'black' || storedTheme === 'light') {
        setThemeMode(storedTheme);
      }
    });
  }, []);

  function setMode(nextMode: ThemeMode) {
    setThemeMode(nextMode);
    void setStoredValue(THEME_KEY, nextMode);
  }

  const value = useMemo(
    () => ({ colors: palettes[mode], mode, setMode }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useStelLootTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useStelLootTheme deve ser usado dentro de StelLootThemeProvider');
  }

  return context;
}
