import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd';
import { themeConfig } from './utils/themeConfig';

import Dashboard from './Pages/Dashboard.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import HomePage from './Pages/HomePage.jsx';
import LiveViewPage from './Pages/LiveViewPage.jsx';
import DevicesPage from './Pages/DevicesPage.jsx';
import ActivityLogPage from './Pages/ActivityLogPage.jsx';
import ConfigPage from './Pages/ConfigPage.jsx';
import ApplicationPage from './Pages/ApplicationPage.jsx';
import ClientDashboard from './Pages/ClientDashboard.jsx'; 

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
      colorBgLayout: 'transparent',
      colorBgContainer: colors.components.card.background,
      colorBorder: colors.border.primary,
      colorText: colors.text.primary,
    },
    components: {
      Layout: {
        bodyBg: 'transparent',
        headerBg: 'transparent',
      },
      Card: {
        colorBgContainer: colors.components.card.background,
      },
      Table: {
        colorBgContainer: colors.components.table.background,
        headerBg: colors.components.table.headerBackground,
      }
    }
  }), [themeMode, colors]);

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Gradient for body background - Pink left top + Subtle curved gold right
  const bodyGradient = themeMode === 'dark'
    ? `
      radial-gradient(ellipse 100% 100% at 0% 0%, #2a2532 0%, rgba(34, 31, 42, 0.7) 40%, transparent 60%),
      radial-gradient(ellipse 80% 120% at 100% 20%, #1c1828 0%, rgba(28, 24, 40, 0.4) 35%, transparent 65%),
      linear-gradient(135deg, #1a1820 0%, #12111a 100%)
    `
    : `
      radial-gradient(ellipse 100% 100% at 0% 0%, #FFF5F7 0%, rgba(255, 249, 245, 0.7) 40%, transparent 60%),
      radial-gradient(ellipse 80% 120% at 100% 20%, #FFEFD5 0%, rgba(255, 245, 220, 0.4) 35%, transparent 65%),
      linear-gradient(135deg, #FFFEF8 0%, #FFF9F0 100%)
    `;

  return (
    <AntdConfigProvider theme={antdThemeConfig}>
      <style>{`
        .ant-layout { background: transparent !important; }
        .ant-layout-header { background: transparent !important; }
        
        /* Body Background with Gradient */
        body { 
          margin: 0; 
          background: ${bodyGradient} !important;
          background-attachment: fixed !important;
          transition: background 0.5s ease;
        }

        /* Scrollbar Styling */
        ${themeMode === 'dark' ? `
          ::-webkit-scrollbar { width: 10px; }
          ::-webkit-scrollbar-track { background: #09090b; }
          ::-webkit-scrollbar-thumb { 
            background: #2C2C2E; 
            border-radius: 5px;
          }
          ::-webkit-scrollbar-thumb:hover { background: #3C3C3E; }
        ` : `
          ::-webkit-scrollbar { width: 10px; }
          ::-webkit-scrollbar-track { background: #FFF8E7; }
          ::-webkit-scrollbar-thumb { 
            background: #E5E0D3; 
            border-radius: 5px;
          }
          ::-webkit-scrollbar-thumb:hover { background: #D5D0C3; }
        `}

        /* Card transparency support */
        .ant-card {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
      
      <div style={{ background: 'transparent', minHeight: '100vh' }}>
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
              <Route path="client-view/:appId" element={<ClientDashboard theme={themeMode} />} />
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