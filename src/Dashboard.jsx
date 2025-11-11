import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

const Dashboard = ({ theme, toggleTheme }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ 
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      transition: 'all 0.3s ease'
    }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        theme={theme}
      />
      
      {/* Fixed Navbar with Menu Button */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: 'transparent'
      }}>
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          theme={theme} 
          toggleTheme={toggleTheme}
        />
      </div>
      
      {/* Main Content Area - This moves */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        marginLeft: isSidebarOpen ? '120px' : '0',
        marginTop: '88px',
        transition: 'margin-left 0.3s ease',
        paddingRight: '24px'
      }}>
        <div style={{ 
          flex: 1,
          padding: '24px',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;