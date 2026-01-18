// Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined, EyeOutlined, ThunderboltOutlined,
  AppstoreOutlined, SettingOutlined, LogoutOutlined
} from '@ant-design/icons';

const Sidebar = ({ isOpen, theme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard/home', icon: <HomeOutlined />, label: 'Home' },
    { key: '/dashboard/live-view', icon: <EyeOutlined />, label: 'Live View' },
    { key: '/dashboard/activity-log', icon: <ThunderboltOutlined />, label: 'Activity Log' },
    { key: '/dashboard/application', icon: <AppstoreOutlined />, label: 'Application' },
    { key: '/dashboard/config', icon: <SettingOutlined />, label: 'Config' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

 return (
    <div style={{
      position: 'fixed',
      left: isOpen ? '24px' : '-120px',
      //sidebar and navabar madhya gap
      top: '140px',
      zIndex: 1000,
      width: '80px',
      height: 'fit-content', // Height automatic ga content batti untundi
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0', // Equal padding top and bottom
      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(25px)',
      borderRadius: '40px', // More rounded as per image
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: theme === 'dark' 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' 
        : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <div key={item.key} onClick={() => navigate(item.key)} style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isActive && (
                <div style={{ 
                  position: 'absolute', left: '-12px', width: '5px', height: '28px', 
                  background: '#10b981', borderRadius: '0 10px 10px 0', top: '11px',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)' 
                }} />
              )}
              <div style={{
                width: '52px', height: '52px', borderRadius: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
                background: isActive ? '#10b981' : 'transparent',
                color: isActive ? '#fff' : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                boxShadow: isActive ? '0 8px 15px rgba(16, 185, 129, 0.3)' : 'none'
              }}>
                {React.cloneElement(item.icon, { style: { fontSize: '22px' } })}
              </div>
            </div>
          );
        })}

        {/* Logout - No extra bottom gap, just the same gap as other items */}
        <div onClick={handleLogout} style={{
          width: '52px', height: '52px', borderRadius: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f43f5e', background: 'rgba(244, 63, 94, 0.08)', cursor: 'pointer',
          marginTop: '8px'
        }}>
          <LogoutOutlined style={{ fontSize: '22px' }} />
        </div>
      </div>
    </div>
  );
};
export default Sidebar;