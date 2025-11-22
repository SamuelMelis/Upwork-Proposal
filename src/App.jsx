import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SettingsPage from './pages/SettingsPage';
import useTelegram from './hooks/useTelegram';

function App() {
  const { isReady, isTelegram, tg, themeParams } = useTelegram();

  useEffect(() => {
    if (isTelegram && tg) {
      // Apply Telegram theme colors to CSS variables
      document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#0f172a');
      document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#94a3b8');
      document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#38bdf8');
      document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#38bdf8');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
    }
  }, [isTelegram, tg, themeParams]);

  if (!isReady) {
    return (
      <div className="app" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-primary)'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
