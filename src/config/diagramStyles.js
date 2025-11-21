// Centralized color palette and theme configuration for all diagrams

export const colors = {
  // Primary Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary Colors
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Accent Colors
  accent: {
    emerald: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    rose: {
      50: '#FFF1F2',
      100: '#FFE4E6',
      200: '#FECDD3',
      300: '#FDA4AF',
      400: '#FB7185',
      500: '#F43F5E',
      600: '#E11D48',
      700: '#BE123C',
      800: '#9F1239',
      900: '#881337',
    },
    amber: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
  },

  // Neutral Colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Background Colors
  background: {
    dark: '#0F172A',
    darker: '#020617',
    light: '#F8FAFC',
    white: '#FFFFFF',
  },
}

// Edge/Line Styles
export const edgeStyles = {
  default: {
    stroke: colors.primary[500],
    strokeWidth: 2,
  },
  highlighted: {
    stroke: colors.secondary[500],
    strokeWidth: 3,
  },
  success: {
    stroke: colors.accent.emerald[500],
    strokeWidth: 2,
  },
  warning: {
    stroke: colors.accent.amber[500],
    strokeWidth: 2,
  },
  error: {
    stroke: colors.accent.rose[500],
    strokeWidth: 2,
  },
  dashed: {
    stroke: colors.neutral[400],
    strokeWidth: 2,
    strokeDasharray: '5,5',
  },
}

// Node Border Styles
export const nodeBorderStyles = {
  primary: `2px solid ${colors.primary[500]}`,
  secondary: `2px solid ${colors.secondary[500]}`,
  success: `2px solid ${colors.accent.emerald[500]}`,
  warning: `2px solid ${colors.accent.amber[500]}`,
  error: `2px solid ${colors.accent.rose[500]}`,
  neutral: `2px solid ${colors.neutral[300]}`,
  thick: `3px solid ${colors.primary[600]}`,
}

// Gradient Backgrounds
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[700]} 100%)`,
  success: `linear-gradient(135deg, ${colors.accent.emerald[500]} 0%, ${colors.accent.emerald[700]} 100%)`,
  purple: `linear-gradient(135deg, #667EEA 0%, #764BA2 100%)`,
  sunset: `linear-gradient(135deg, ${colors.accent.rose[400]} 0%, ${colors.accent.amber[500]} 100%)`,
  ocean: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[500]} 100%)`,
  forest: `linear-gradient(135deg, ${colors.accent.emerald[400]} 0%, ${colors.accent.emerald[600]} 100%)`,
}

// Shadow Styles
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 4px 10px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 20px rgba(0, 0, 0, 0.2)',
  xl: '0 10px 40px rgba(0, 0, 0, 0.3)',
  primary: `0 8px 20px rgba(59, 130, 246, 0.4)`,
  secondary: `0 8px 20px rgba(139, 92, 246, 0.4)`,
  success: `0 4px 12px rgba(16, 185, 129, 0.3)`,
}

// Typography
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), system-ui, sans-serif',
    mono: 'var(--font-geist-mono), monospace',
  },
  fontSize: {
    xs: '10px',
    sm: '11px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '24px',
    '3xl': '28px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
}

// Border Radius
export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  '2xl': '12px',
  full: '9999px',
}

// Actor/Role Colors (for User Journey)
export const actorColors = {
  User: colors.primary[500],
  System: colors.secondary[500],
  Restaurant: colors.accent.rose[500],
  Admin: colors.accent.amber[500],
  Default: colors.neutral[500],
}

// Risk Level Colors (for Requirements)
export const riskColors = {
  high: colors.error,
  medium: colors.warning,
  low: colors.success,
}

// Score Colors (for User Journey)
export const scoreColors = {
  excellent: colors.accent.emerald[500], // 5
  good: colors.accent.emerald[400],      // 4
  average: colors.accent.amber[500],     // 3
  poor: colors.accent.amber[600],        // 2
  bad: colors.error,                     // 1
}

// Animation Configurations
export const animations = {
  // Node animations
  fadeIn: {
    name: 'fadeIn',
    duration: '0.5s',
    timing: 'ease-in',
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
  },
  slideInLeft: {
    name: 'slideInLeft',
    duration: '0.6s',
    timing: 'ease-out',
    keyframes: `
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-50px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `
  },
  slideInRight: {
    name: 'slideInRight',
    duration: '0.6s',
    timing: 'ease-out',
    keyframes: `
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(50px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `
  },
  scaleUp: {
    name: 'scaleUp',
    duration: '0.4s',
    timing: 'ease-out',
    keyframes: `
      @keyframes scaleUp {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
    `
  },
  pulse: {
    name: 'pulse',
    duration: '2s',
    timing: 'ease-in-out',
    infinite: true,
    keyframes: `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `
  },
  bounce: {
    name: 'bounce',
    duration: '1s',
    timing: 'ease-in-out',
    infinite: true,
    keyframes: `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `
  },

  // Edge animations
  dashdraw: {
    name: 'dashdraw',
    duration: '0.5s',
    timing: 'linear',
    infinite: true,
    keyframes: `
      @keyframes dashdraw {
        to { stroke-dashoffset: -10; }
      }
    `
  },
  flow: {
    name: 'flow',
    duration: '1s',
    timing: 'ease-in-out',
    infinite: true,
    keyframes: `
      @keyframes flow {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `
  },

  // Text animations
  textGlow: {
    name: 'textGlow',
    duration: '2s',
    timing: 'ease-in-out',
    infinite: true,
    keyframes: `
      @keyframes textGlow {
        0%, 100% { text-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
      }
    `
  }
}

// Helper function to get score color
export const getScoreColor = (score) => {
  if (score >= 5) return scoreColors.excellent
  if (score >= 4) return scoreColors.good
  if (score >= 3) return scoreColors.average
  if (score >= 2) return scoreColors.poor
  return scoreColors.bad
}

// Helper function to get risk color
export const getRiskColor = (risk) => {
  const riskLevel = risk?.toLowerCase()
  return riskColors[riskLevel] || colors.neutral[500]
}

// Helper function to get actor color
export const getActorColor = (actor) => {
  return actorColors[actor] || actorColors.Default
}

// Default theme configuration
export const defaultTheme = {
  primaryColor: colors.primary[500],
  secondaryColor: colors.secondary[500],
  backgroundColor: colors.background.white,
  textColor: colors.neutral[900],
  borderColor: colors.neutral[300],
  nodeAnimation: 'fadeIn',
  edgeAnimation: 'none',
  textAnimation: 'none',
}

// Pre-defined theme presets
export const themePresets = {
  default: {
    name: 'Default Blue',
    primaryColor: colors.primary[500],
    secondaryColor: colors.secondary[500],
    backgroundColor: colors.background.white,
  },
  purple: {
    name: 'Purple Dream',
    primaryColor: colors.secondary[500],
    secondaryColor: colors.primary[500],
    backgroundColor: colors.background.light,
  },
  emerald: {
    name: 'Emerald Green',
    primaryColor: colors.accent.emerald[500],
    secondaryColor: colors.accent.emerald[700],
    backgroundColor: colors.background.white,
  },
  sunset: {
    name: 'Sunset',
    primaryColor: colors.accent.rose[500],
    secondaryColor: colors.accent.amber[500],
    backgroundColor: colors.background.light,
  },
  ocean: {
    name: 'Ocean',
    primaryColor: colors.primary[600],
    secondaryColor: colors.primary[400],
    backgroundColor: colors.background.white,
  },
  dark: {
    name: 'Dark Mode',
    primaryColor: colors.primary[400],
    secondaryColor: colors.secondary[400],
    backgroundColor: colors.background.dark,
  }
}
