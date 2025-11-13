// buttonStyles.js
// Centralized button styling configuration
// Change colors here to apply across all pages

export const buttonStyles = {
  // Primary Buttons (Add, Create, Save, Submit actions)
  primary: {
    light: {
      backgroundColor: '#6366f1', // Indigo
      hoverBackgroundColor: '#4f46e5',
      color: '#ffffff',
      borderColor: '#6366f1',
    },
    dark: {
      backgroundColor: '#818cf8',
      hoverBackgroundColor: '#a5b4fc',
      color: '#ffffff',
      borderColor: '#818cf8',
    }
  },

  // Danger Buttons (Delete, Remove actions)
  danger: {
    light: {
      backgroundColor: '#ef4444', // Red
      hoverBackgroundColor: '#dc2626',
      color: '#ffffff',
      borderColor: '#ef4444',
    },
    dark: {
      backgroundColor: '#ef4444',
      hoverBackgroundColor: '#dc2626',
      color: '#ffffff',
      borderColor: '#ef4444',
    }
  },

  // Success Buttons (Confirm, Approve actions)
  success: {
    light: {
      backgroundColor: '#10b981', // Green
      hoverBackgroundColor: '#059669',
      color: '#ffffff',
      borderColor: '#10b981',
    },
    dark: {
      backgroundColor: '#10b981',
      hoverBackgroundColor: '#059669',
      color: '#ffffff',
      borderColor: '#10b981',
    }
  },

  // Secondary/Text Buttons (Cancel, Back actions)
  secondary: {
    light: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: 'rgba(99, 102, 241, 0.1)',
      color: '#6366f1',
      borderColor: '#e5e7eb',
    },
    dark: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: 'rgba(129, 140, 248, 0.1)',
      color: '#818cf8',
      borderColor: '#374151',
    }
  },

  // Menu/Sidebar Buttons
  menu: {
    light: {
      backgroundColor: 'rgba(167, 139, 167, 0.75)',
      hoverBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      activeBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      color: '#ffffff',
    },
    dark: {
      backgroundColor: 'rgba(167, 139, 167, 0.75)',
      hoverBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      activeBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      color: '#ffffff',
    }
  },

  // Icon Buttons (Edit, View, etc.)
  icon: {
    light: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: 'rgba(99, 102, 241, 0.1)',
      color: '#6366f1',
      borderColor: '#e5e7eb',
    },
    dark: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: 'rgba(129, 140, 248, 0.1)',
      color: '#818cf8',
      borderColor: '#374151',
    }
  },

  // Logout Button
  logout: {
   light: {
      backgroundColor: 'rgba(167, 139, 167, 0.75)',
      hoverBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      activeBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      color: '#ffffff',
    },
    dark: {
      backgroundColor: 'rgba(167, 139, 167, 0.75)',
      hoverBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      activeBackgroundColor: 'rgba(167, 139, 167, 0.95)',
      color: '#ffffff',
    }
  },

  // Common button properties
  common: {
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontWeight: '500',
  }
};

// Helper function to get button style based on type and theme
export const getButtonStyle = (type, theme, isHover = false, isActive = false) => {
  const themeMode = theme === 'light' ? 'light' : 'dark';
  const typeStyles = buttonStyles[type] || buttonStyles.primary;
  const styles = typeStyles[themeMode];
  
  return {
    ...buttonStyles.common,
    backgroundColor: isActive 
      ? (styles.activeBackgroundColor || styles.backgroundColor)
      : isHover 
        ? styles.hoverBackgroundColor 
        : styles.backgroundColor,
    color: styles.color,
    borderColor: styles.borderColor,
  };
};