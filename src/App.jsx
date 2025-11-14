import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd';
import { themeConfig } from './utils/themeConfig';

import Dashboard from './Dashboard';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import LiveViewPage from './LiveViewPage';
import DevicesPage from './DevicesPage';
import ActivityLogPage from './ActivityLogPage';
import ConfigPage from './ConfigPage';
import ApplicationPage from './ApplicationPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const colors = themeConfig[themeMode];
  
  const antdThemeConfig = useMemo(() => ({
    algorithm: themeMode === 'light' ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,
    token: {
      // Background colors from themeConfig
      colorBgContainer: colors.background.primary,
      colorBgElevated: colors.background.elevated,
      colorBgLayout: colors.background.secondary,
      colorBgBase: colors.background.primary,
      
      // Border colors
      colorBorder: colors.border.primary,
      colorBorderSecondary: colors.border.secondary,
      
      // Text colors
      colorText: colors.text.primary,
      colorTextSecondary: colors.text.secondary,
      colorTextTertiary: colors.text.tertiary,
      
      // Primary colors
      colorPrimary: colors.brand.primary,
      colorPrimaryHover: colors.brand.primaryHover,
      
      // Status colors
      colorSuccess: colors.status.success,
      colorError: colors.status.error,
      colorWarning: colors.status.warning,
      colorInfo: colors.status.info,
      
      // Component specific
      colorBgSpotlight: colors.background.primary,
      
      // Border radius
      borderRadius: 8,
    },
    components: {
      Layout: {
        bodyBg: colors.background.secondary,
        headerBg: colors.components.navbar.background,
        siderBg: colors.components.sidebar.background,
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: colors.components.sidebar.itemActive,
        itemSelectedColor: colors.text.inverse,
        itemHoverBg: colors.components.sidebar.itemHover,
        itemActiveBg: colors.components.sidebar.itemActive,
      },
      Card: {
        colorBgContainer: colors.components.card.background,
      },
      Table: {
        colorBgContainer: colors.components.table.background,
        headerBg: colors.components.table.headerBackground,
        borderColor: colors.border.primary,
      },
      Input: {
        colorBgContainer: colors.components.input.background,
        colorBorder: colors.components.input.border,
        activeBorderColor: colors.components.input.focus,
        hoverBorderColor: colors.components.input.focus,
      },
      Modal: {
        contentBg: colors.components.modal.background,
        headerBg: colors.components.modal.background,
      },
      Button: {
        colorPrimary: colors.brand.primary,
        colorPrimaryHover: colors.brand.primaryHover,
      }
    }
  }), [themeMode, colors]);

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <AntdConfigProvider theme={antdThemeConfig}>
      <div style={{ 
        backgroundColor: colors.background.secondary,
        minHeight: '100vh',
        color: colors.text.primary
      }}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage theme={themeMode} />} />
            <Route path="/" element={<Navigate to="/dashboard/home" />} />
            
            <Route 
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard theme={themeMode} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            >
              <Route path="home" element={<HomePage theme={themeMode} />} />
              <Route path="live-view" element={<LiveViewPage theme={themeMode} />} />
              <Route path="devices" element={<DevicesPage theme={themeMode} />} />
              <Route path="activity-log" element={<ActivityLogPage theme={themeMode} />} />
              <Route path="config" element={<ConfigPage theme={themeMode} />} />
              <Route path="application" element={<ApplicationPage theme={themeMode} />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </AntdConfigProvider>
  );
}

export default App;