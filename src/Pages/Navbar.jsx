// Navbar.jsx
import React from 'react';
import { Button, Avatar, Space, Typography, Dropdown } from 'antd'; // Dropdown add chesam
import { 
  SettingOutlined, 
  UserOutlined, 
  MoonOutlined, 
  SunOutlined,
  LogoutOutlined // Logout icon add chesam
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Text } = Typography;

const Navbar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Dropdown menu items
  const menuItems = [
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true, // Red color lo kanipistundi
      onClick: handleLogout,
    },
  ];

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard/home' },
    { label: 'Cameras', path: '/dashboard/live-view' },
    { label: 'Applications', path: '/dashboard/application' },
    { label: 'Activity', path: '/dashboard/activity-log' },
  ];

  return (
    <div style={{
      padding: '20px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'transparent'
    }}>
      {/* Brand Logo Section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: theme === 'dark' ? '#1a1c1e' : '#fff', 
        padding: '10px 25px', 
        borderRadius: '50px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
      }}>
        <Text strong style={{ fontSize: '18px', color: theme === 'dark' ? '#fff' : '#000' }}>MyAccess</Text>
        <Text style={{ fontSize: '18px', color: '#10b981', fontWeight: '900', marginLeft: '2px' }}>Kiosk</Text>
      </div>

      {/* Center Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '5px', 
        background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)', 
        padding: '5px', 
        borderRadius: '50px', 
        backdropFilter: 'blur(10px)' 
      }}>
        {navLinks.map(link => (
          <Button 
            key={link.path}
            type="text"
            onClick={() => navigate(link.path)}
            style={{
              borderRadius: '40px',
              fontWeight: 600,
              padding: '0 25px',
              height: '40px',
              backgroundColor: location.pathname === link.path 
                ? (theme === 'dark' ? '#fff' : '#1e1e1e') 
                : 'transparent',
              color: location.pathname === link.path 
                ? (theme === 'dark' ? '#000' : '#fff') 
                : (theme === 'dark' ? '#9ca3af' : '#64748b'),
              transition: 'all 0.3s'
            }}
          >
            {link.label}
          </Button>
        ))}
      </div>

      {/* Right Icons */}
      <Space size="large">
        <Button 
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} 
          shape="circle" 
          type="text" 
          style={{ 
            fontSize: '20px', 
            color: theme === 'dark' ? '#facc15' : '#000000' 
          }} 
          onClick={toggleTheme} 
        />

        <Button 
          icon={<SettingOutlined />} 
          shape="circle" 
          type="text" 
          style={{ fontSize: '20px', color: theme === 'dark' ? '#fff' : '#000000' }} 
          onClick={() => navigate('/dashboard/config')} 
        />
        
        {/* Dropdown with Logout Option */}
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <Avatar 
            size={45} 
            icon={<UserOutlined />} 
            style={{ 
              cursor: 'pointer', 
              border: theme === 'dark' ? '2px solid #333' : '2px solid #fff', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
            }} 
          />
        </Dropdown>
      </Space>
    </div>
  );
};

export default Navbar;