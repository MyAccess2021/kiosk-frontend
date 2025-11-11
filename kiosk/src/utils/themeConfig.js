// themeConfig.js
// Centralized theme configuration
// Change colors here to apply across all pages

export const themeConfig = {
  light: {
    // Background Colors
    background: {
      primary: '#ffffff',        // Main content background
      secondary: '#f4f6f8',      // Page background
      elevated: '#ffffff',       // Cards, modals
      hover: 'rgba(99, 102, 241, 0.1)', // Hover states
    },
    
    // Text Colors
    text: {
      primary: '#111827',        // Main text
      secondary: '#6b7280',      // Secondary text
      tertiary: '#9ca3af',       // Disabled/placeholder text
      inverse: '#ffffff',        // Text on dark backgrounds
    },
    
    // Border Colors
    border: {
      primary: '#e5e7eb',        // Main borders
      secondary: '#f3f4f6',      // Subtle borders
      focus: '#6366f1',          // Focus state borders
    },
    
    // Brand Colors
    brand: {
      primary: '#6366f1',        // Primary brand color (Indigo)
      primaryHover: '#4f46e5',   // Primary hover state
      secondary: '#818cf8',      // Secondary brand color
    },
    
    // Status Colors
    status: {
      success: '#10b981',        // Success states
      error: '#ef4444',          // Error states
      warning: '#f59e0b',        // Warning states
      info: '#3b82f6',           // Info states
    },
    
    // Component Specific
    components: {
      navbar: {
        background: 'rgba(255, 255, 255, 0.5)',
        backdropBlur: 'blur(10px)',
      },
      sidebar: {
        background: '#ffffff',
        itemBackground: 'rgba(167, 139, 167, 0.75)',
        itemHover: 'rgba(167, 139, 167, 0.95)',
        itemActive: 'rgba(167, 139, 167, 0.95)',
      },
      card: {
        background: '#ffffff',
        shadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      table: {
        background: '#ffffff',
        headerBackground: '#f9fafb',
      },
      input: {
        background: '#ffffff',
        border: '#e5e7eb',
        focus: '#6366f1',
      },
      modal: {
        background: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.45)',
      }
    },
    
    // Shadows
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 2px 8px rgba(0, 0, 0, 0.1)',
      large: '0 4px 16px rgba(0, 0, 0, 0.15)',
    }
  },
  
  dark: {
    // Background Colors
    background: {
      primary: '#1f2937',        // Main content background
      secondary: '#111827',      // Page background
      elevated: '#1f2937',       // Cards, modals
      hover: 'rgba(129, 140, 248, 0.1)', // Hover states
    },
    
    // Text Colors
    text: {
      primary: '#f3f4f6',        // Main text
      secondary: '#9ca3af',      // Secondary text
      tertiary: '#6b7280',       // Disabled/placeholder text
      inverse: '#111827',        // Text on light backgrounds
    },
    
    // Border Colors
    border: {
      primary: '#374151',        // Main borders
      secondary: '#2d3748',      // Subtle borders
      focus: '#818cf8',          // Focus state borders
    },
    
    // Brand Colors
    brand: {
      primary: '#818cf8',        // Primary brand color
      primaryHover: '#a5b4fc',   // Primary hover state
      secondary: '#6366f1',      // Secondary brand color
    },
    
    // Status Colors
    status: {
      success: '#10b981',        // Success states
      error: '#ef4444',          // Error states
      warning: '#f59e0b',        // Warning states
      info: '#3b82f6',           // Info states
    },
    
    // Component Specific
    components: {
      navbar: {
        background: 'rgba(31, 41, 55, 0.5)',
        backdropBlur: 'blur(10px)',
      },
      sidebar: {
        background: '#1f2937',
        itemBackground: 'rgba(167, 139, 167, 0.75)',
        itemHover: 'rgba(167, 139, 167, 0.95)',
        itemActive: 'rgba(167, 139, 167, 0.95)',
      },
      card: {
        background: '#1f2937',
        shadow: '0 2px 8px rgba(0,0,0,0.3)',
      },
      table: {
        background: '#1f2937',
        headerBackground: '#111827',
      },
      input: {
        background: '#374151',
        border: '#4b5563',
        focus: '#818cf8',
      },
      modal: {
        background: '#1f2937',
        overlay: 'rgba(0, 0, 0, 0.65)',
      }
    },
    
    // Shadows
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.3)',
      medium: '0 2px 8px rgba(0, 0, 0, 0.3)',
      large: '0 4px 16px rgba(0, 0, 0, 0.4)',
    }
  }
};

// Helper function to get current theme colors
export const getThemeColors = (theme) => {
  return themeConfig[theme === 'light' ? 'light' : 'dark'];
};

// Helper function to get specific color
export const getThemeColor = (theme, category, property) => {
  const colors = getThemeColors(theme);
  return colors[category]?.[property] || colors.background.primary;
};