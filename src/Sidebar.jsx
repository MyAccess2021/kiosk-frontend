import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  EyeOutlined,
  HddOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { buttonStyles } from './utils/buttonStyles';
import { themeConfig } from './utils/themeConfig';

const Sidebar = ({ isOpen, toggleSidebar, theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const colors = themeConfig[theme];
  const menuBtn = buttonStyles.menu[theme];
  const logoutBtn = buttonStyles.logout[theme];

  const menuItems = [
    { key: '/dashboard/home', icon: <HomeOutlined />, label: 'Home' },
    { key: '/dashboard/live-view', icon: <EyeOutlined />, label: 'Live View' },
    // { key: '/dashboard/devices', icon: <HddOutlined />, label: 'Devices' },
    { key: '/dashboard/activity-log', icon: <ThunderboltOutlined />, label: 'Activity Log' },
    { key: '/dashboard/application', icon: <AppstoreOutlined />, label: 'Application' },
    { key: '/dashboard/config', icon: <SettingOutlined />, label: 'Config' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    navigate(path);
    // If on a mobile device, close the sidebar after clicking an item
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Floating Sidebar */}
       
        <div
  style={{
    position: 'fixed',
    left: isOpen ? '24px' : '-100px', // Corrected this line for consistent alignment
    top: window.innerWidth < 768 ? '88px' : '50%',
    transform: window.innerWidth < 768 ? 'none' : 'translateY(-50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          transition: 'left 0.3s ease-out, opacity 0.3s ease-out',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'visible',
          paddingTop: '8px',
          paddingBottom: '8px',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE and Edge
        }}
        className="sidebar-scroll-hidden"
      >
        {menuItems.map((item, index) => (
          <div
            key={item.key}
            style={{
              animation: isOpen ? `waterfallIn 0.4s ease-out ${index * 0.08}s both` : 'none',
              opacity: isOpen ? 1 : 0
            }}
          >
            <div
              onClick={() => handleMenuClick(item.key)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: location.pathname === item.key
                  ? menuBtn.activeBackgroundColor
                  : menuBtn.backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: buttonStyles.common.transition,
                boxShadow: location.pathname === item.key
                  ? '0 4px 16px rgba(167, 139, 167, 0.4)'
                  : colors.shadows.medium,
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = menuBtn.hoverBackgroundColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = location.pathname === item.key
                  ? menuBtn.activeBackgroundColor
                  : menuBtn.backgroundColor;
              }}
            >
              {React.cloneElement(item.icon, {
                style: { fontSize: '22px', color: menuBtn.color }
              })}
            </div>
            <div style={{
              marginTop: '4px',
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: '500',
              color: colors.text.primary,
              textShadow: theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '70px'
            }}>
              {item.label}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: '6px',
            animation: isOpen ? `waterfallIn 0.4s ease-out ${menuItems.length * 0.08}s both` : 'none',
            opacity: isOpen ? 1 : 0
          }}
        >
          <div
            onClick={handleLogout}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: logoutBtn.backgroundColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: buttonStyles.common.transition,
              boxShadow: colors.shadows.medium,
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = logoutBtn.hoverBackgroundColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = logoutBtn.backgroundColor;
            }}
          >
            <LogoutOutlined style={{ fontSize: '22px', color: logoutBtn.color }} />
          </div>
          <div style={{
            marginTop: '4px',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: '500',
            color: colors.text.primary,
            textShadow: theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            Logout
          </div>
        </div>

        <style>{`
          @keyframes waterfallIn {
            from {
              opacity: 0;
              transform: translateX(-30px) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0) translateY(0);
            }
          }
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          .sidebar-scroll-hidden::-webkit-scrollbar {
            display: none;
          }
        `}
        </style>
      </div>
    </>
  );
};

export default Sidebar;