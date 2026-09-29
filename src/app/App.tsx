import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createAppTheme, ThemeModeContext, type AppThemeMode } from './theme';
import { router } from './router';

export function App() {
  const { i18n } = useTranslation();
  const direction = i18n.language.startsWith('en') ? 'ltr' : 'rtl';
  
  const [mode, setMode] = useState<AppThemeMode>(() => {
    const saved = localStorage.getItem('nri.themeMode') as AppThemeMode | null;
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('nri.themeMode', next);
      return next;
    });
  };

  const handleSetMode = (newMode: AppThemeMode) => {
    setMode(newMode);
    localStorage.setItem('nri.themeMode', newMode);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [mode, direction, i18n.language]);

  const theme = useMemo(() => createAppTheme(direction, mode), [direction, mode]);
  const cache = useMemo(
    () =>
      createCache({
        key: direction === 'rtl' ? 'muirtl' : 'muiltr',
        stylisPlugins: (direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer]) as never,
      }),
    [direction],
  );

  const themeContextValue = useMemo(
    () => ({
      mode,
      toggleMode,
      setMode: handleSetMode,
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={themeContextValue}>
      <CacheProvider key={direction} value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </CacheProvider>
    </ThemeModeContext.Provider>
  );
}
