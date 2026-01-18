

export const themeConfig = {
  light: {
    // Background Colors - Curved gradient from pink/cream to gold
    background: {
      primary: '#FAF8F3',
      secondary: '#F5F1E8',
      elevated: 'rgba(255, 255, 255, 0.85)',
      accent: '#E8E3D6',
      // Curved gradient: Pink/Rose left → Gold/Warm right
      gradient: 'radial-gradient(ellipse 120% 100% at 0% 50%, #FFE5E5 0%, #FFF5E5 30%, #FFF9E5 60%, #FFE4B5 100%)',
      gradientAlt: 'linear-gradient(135deg, #FFE5EC 0%, #FFF0E5 25%, #FFF5E0 50%, #FFEAC5 75%, #FFE4B5 100%)',
    },
    
    // Text Colors
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#ffffff',
      muted: '#8B8B8B',
    },
    
    // Border Colors
    border: {
      primary: '#E5E0D3',
      secondary: '#F0EBE0',
      focus: '#4A5568',
      divider: 'rgba(0, 0, 0, 0.06)',
    },
    
    // Brand Colors
    brand: {
      primary: '#2D3748',
      primaryHover: '#1a202c',
      accent: '#D4AF37',
      secondary: '#4A5568',
      pink: '#FFB6C1',
      gold: '#FFD700',
    },
    
    // Status Colors
    status: {
      success: '#48BB78',
      error: '#F56565',
      warning: '#ED8936',
      info: '#4299E1',
      neutral: '#A0AEC0',
    },
    
    // Component Specific
    components: {
      navbar: {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropBlur: 'blur(12px)',
        border: 'rgba(0, 0, 0, 0.06)',
      },
      sidebar: {
        background: 'rgba(255, 255, 255, 0.9)',
        itemBackground: 'rgba(229, 224, 211, 0.4)',
        itemHover: 'rgba(229, 224, 211, 0.7)',
        itemActive: '#E5E0D3',
        text: '#2D3748',
        textActive: '#1a1a1a',
      },
      card: {
        background: 'rgba(255, 255, 255, 0.85)',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        hover: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: 'rgba(0, 0, 0, 0.04)',
      },
      table: {
        background: 'rgba(255, 255, 255, 0.9)',
        headerBackground: '#F5F1E8',
        rowHover: 'rgba(229, 224, 211, 0.3)',
        border: '#E5E0D3',
      },
      input: {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '#E5E0D3',
        focus: '#4A5568',
        placeholder: '#999999',
      },
      modal: {
        background: 'rgba(255, 255, 255, 0.95)',
        overlay: 'rgba(26, 26, 26, 0.4)',
      },
      chart: {
        grid: 'rgba(0, 0, 0, 0.05)',
        primary: '#48BB78',
        secondary: '#ED8836',
        tertiary: '#4299E1',
      }
    },
    
    // Shadows
    shadows: {
      small: '0 1px 2px rgba(0, 0, 0, 0.04)',
      medium: '0 2px 8px rgba(0, 0, 0, 0.08)',
      large: '0 8px 24px rgba(0, 0, 0, 0.12)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.15)',
    }
  },
  
  dark: {
    // Background Colors - Dark gradient: Deep purple-blue left → Dark navy right
    background: {
      primary: '#0A0A0B',
      secondary: '#141416',
      elevated: 'rgba(26, 26, 28, 0.8)',
      accent: '#1C1C1E',
      // Dark curved gradient: Purple-blue left → Navy/Black right
      gradient: 'radial-gradient(ellipse 120% 100% at 0% 50%, #1a1625 0%, #141420 30%, #0f0f18 60%, #0a0a0f 100%)',
      gradientAlt: 'linear-gradient(135deg, #1e1b2e 0%, #151520 25%, #0f0f18 50%, #0b0b10 75%, #0a0a0b 100%)',
    },
    
    // Text Colors
    text: {
      primary: '#F5F5F5',
      secondary: '#A1A1A6',
      tertiary: '#6B6B70',
      inverse: '#0A0A0B',
      muted: '#8E8E93',
    },
    
    // Border Colors
    border: {
      primary: '#2C2C2E',
      secondary: '#1C1C1E',
      focus: '#60A5FA',
      divider: 'rgba(255, 255, 255, 0.06)',
    },
    
    // Brand Colors
    brand: {
      primary: '#60A5FA',
      primaryHover: '#93C5FD',
      accent: '#FBBF24',
      secondary: '#8B5CF6',
      purple: '#9333EA',
      blue: '#3B82F6',
    },
    
    // Status Colors
    status: {
      success: '#34D399',
      error: '#F87171',
      warning: '#FBBF24',
      info: '#60A5FA',
      neutral: '#6B7280',
    },
    
    // Component Specific
    components: {
      navbar: {
        background: 'rgba(20, 20, 22, 0.7)',
        backdropBlur: 'blur(12px)',
        border: 'rgba(255, 255, 255, 0.06)',
      },
      sidebar: {
        background: 'rgba(20, 20, 22, 0.9)',
        itemBackground: 'rgba(44, 44, 46, 0.5)',
        itemHover: 'rgba(44, 44, 46, 0.8)',
        itemActive: '#2C2C2E',
        text: '#F5F5F5',
        textActive: '#FFFFFF',
      },
      card: {
        background: 'rgba(26, 26, 28, 0.8)',
        shadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)',
        hover: '0 4px 16px rgba(0, 0, 0, 0.5)',
        border: 'rgba(255, 255, 255, 0.06)',
      },
      table: {
        background: 'rgba(20, 20, 22, 0.9)',
        headerBackground: '#0A0A0B',
        rowHover: 'rgba(44, 44, 46, 0.4)',
        border: '#2C2C2E',
      },
      input: {
        background: 'rgba(28, 28, 30, 0.95)',
        border: '#2C2C2E',
        focus: '#60A5FA',
        placeholder: '#6B6B70',
      },
      modal: {
        background: 'rgba(20, 20, 22, 0.95)',
        overlay: 'rgba(0, 0, 0, 0.75)',
      },
      chart: {
        grid: 'rgba(255, 255, 255, 0.05)',
        primary: '#34D399',
        secondary: '#FBBF24',
        tertiary: '#60A5FA',
      }
    },
    
    // Shadows
    shadows: {
      small: '0 1px 2px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.4)',
      large: '0 8px 24px rgba(0, 0, 0, 0.5)',
      xl: '0 20px 48px rgba(0, 0, 0, 0.6)',
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