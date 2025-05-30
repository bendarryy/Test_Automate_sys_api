import { useState } from 'react';
import { ThemeContext } from './ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from './theme';
import { ConfigProvider, theme } from 'antd';
import { unstable_batchedUpdates } from 'react-dom';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    unstable_batchedUpdates(() => {
      document.documentElement.style.transition = 'all 0.2s linear';
      setThemeMode(prev => {
        const newTheme = prev === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return newTheme;
      });
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: themeMode === 'dark' ? '#177ddc' : '#1890ff',
          },
        }}
      >
        <StyledThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
          {children}
        </StyledThemeProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};