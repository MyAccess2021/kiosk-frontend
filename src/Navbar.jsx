import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Avatar, Dropdown, Space } from 'antd';
import {
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { buttonStyles } from './utils/buttonStyles';
import { themeConfig } from './utils/themeConfig';

const Navbar = ({ toggleSidebar, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const colors = themeConfig[theme];
  const menuBtn = buttonStyles.menu[theme];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
   
    {
      key: '2',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/dashboard/config'),
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div
      style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Changed to space-between
        position: 'sticky',
        top: 0,
        zIndex: 998,
        backgroundColor: 'transparent'
      }}
    >
      {/* Menu Toggle Button */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={toggleSidebar}
        style={{
          fontSize: '20px',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          backgroundColor: menuBtn.backgroundColor,
          backdropFilter: 'blur(10px)',
          border: 'none',
          color: menuBtn.color,
          transition: buttonStyles.common.transition,
          boxShadow: colors.shadows.large,
          zIndex: 1001
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = menuBtn.hoverBackgroundColor;
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = menuBtn.backgroundColor;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />

      {/* Right side actions */}
      <Space size="middle">
        <Button
          type="text"
          icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleTheme}
          style={{
            fontSize: '18px',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            backgroundColor: colors.components.navbar.background,
            backdropFilter: colors.components.navbar.backdropBlur,
            border: 'none',
            color: colors.text.primary,
            transition: buttonStyles.common.transition,
            boxShadow: colors.shadows.small
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(31, 41, 55, 0.8)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.components.navbar.background;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <div style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '12px',
            backgroundColor: colors.components.navbar.background,
            backdropFilter: colors.components.navbar.backdropBlur,
            transition: buttonStyles.common.transition,
            boxShadow: colors.shadows.small
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'light'
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(31, 41, 55, 0.8)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.components.navbar.background;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: colors.brand.primary
              }}
            />
            {!isMobile && (
              <span style={{
                fontWeight: 500,
                color: colors.text.primary,
              }}>
                {user?.name || 'User'}
              </span>
            )}
          </div>
        </Dropdown>
      </Space>
    </div>
  );
};

export default Navbar;