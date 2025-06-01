import { useState, useCallback, useMemo, memo } from 'react';
import { ThemeContext } from './ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from './theme';
import { ConfigProvider, theme } from 'antd';


// مكون بسيط وفعال لتغليف مزودي الثيم
const ThemeProviders = memo(({ themeMode, children }: { themeMode: 'light' | 'dark'; children: React.ReactNode }) => {
  const antdTheme = useMemo(
    () => ({
      algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: { colorPrimary: themeMode === 'dark' ? '#177ddc' : '#1890ff' },
    }),
    [themeMode]
  );

  const styledTheme = useMemo(() => (themeMode === 'light' ? lightTheme : darkTheme), [themeMode]);

  return (
    <ConfigProvider theme={antdTheme}>
      <StyledThemeProvider theme={styledTheme}>{children}</StyledThemeProvider>
    </ConfigProvider>
  );
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    // غيّر data-theme مباشرة ثم حدث الحالة
    requestAnimationFrame(() => {
      setThemeMode(prev => {
        const next = prev === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        return next;
      });
    });
  }, []);

  const contextValue = useMemo(() => ({ theme: themeMode, toggleTheme }), [themeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProviders themeMode={themeMode}>{children}</ThemeProviders>
    </ThemeContext.Provider>
  );
};