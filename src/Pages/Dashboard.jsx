import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar';

const Dashboard = ({ theme, toggleTheme }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // If we switch to mobile view, close the sidebar.
      // If we switch to desktop, open it.
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      transition: 'all 0.3s ease',
      backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb'
    }}>
      {/* Background Overlay for Mobile */}
      {isSidebarOpen && isMobile && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 999, // zIndex should be below sidebar (1000) but above content
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        theme={theme}
      />

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: 'transparent'
      }}>
        <Navbar
          toggleSidebar={toggleSidebar}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        // Only apply margin on desktop view
        marginLeft: isSidebarOpen && !isMobile ? '120px' : '0',
        paddingLeft: '24px',
        paddingRight: '24px',
        marginTop: '88px',
        transition: 'margin-left 0.3s ease',
      }}>
        <div style={{
          flex: 1,
          padding: '24px 0',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;