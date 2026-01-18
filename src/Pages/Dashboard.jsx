// Dashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Dashboard = ({ theme, toggleTheme }) => {
  // Light Theme: Soft Pink (left top) → Cream (center) → Subtle Gold (right - curved)
  // Right side gold ni reduce chesi, curve effect tho natural ga blend
  const lightGradient = `
    radial-gradient(ellipse 100% 100% at 0% 0%, #FFF5F7 0%, rgba(255, 249, 245, 0.7) 40%, transparent 60%),
    radial-gradient(ellipse 80% 120% at 100% 20%, #FFEFD5 0%, rgba(255, 245, 220, 0.4) 35%, transparent 65%),
    linear-gradient(135deg, #FFFEF8 0%, #FFF9F0 100%)
  `;
  
  // Dark Theme: Soft Purple (left top) → Medium (center) → Subtle dark (right - curved)
  const darkGradient = `
    radial-gradient(ellipse 100% 100% at 0% 0%, #2a2532 0%, rgba(34, 31, 42, 0.7) 40%, transparent 60%),
    radial-gradient(ellipse 80% 120% at 100% 20%, #1c1828 0%, rgba(28, 24, 40, 0.4) 35%, transparent 65%),
    linear-gradient(135deg, #1a1820 0%, #12111a 100%)
  `;
  
  const gradientStyle = theme === 'dark' ? darkGradient : lightGradient;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: gradientStyle,
      backgroundAttachment: 'fixed',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Right side gold glow - curved and subtle */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: 0,
        width: '35%',
        height: '50%',
        background: theme === 'dark' 
          ? 'radial-gradient(ellipse 70% 90% at 90% 30%, rgba(100, 80, 150, 0.08) 0%, transparent 60%)'
          : 'radial-gradient(ellipse 70% 90% at 90% 30%, rgba(255, 230, 180, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      
      {/* Left top corner pink/purple glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '40%',
        height: '40%',
        background: theme === 'dark' 
          ? 'radial-gradient(circle at 0% 0%, rgba(147, 100, 200, 0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle at 0% 0%, rgba(255, 200, 220, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div style={{ flex: 1, padding: '0 60px', background: 'transparent' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;