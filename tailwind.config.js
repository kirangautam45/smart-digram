/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from your theme
        'custom-dark-blue': '#111827',
        'custom-text-gray': '#FFFFFFB3',
        'custom-text-black': '#171717',
        'custom-dashboard-bg': '#F1F5F9',
        'custom-dark-red': '#EF5350',
        'custom-dark-green': '#4CAF50',
        'custom-dark-purple': '#3730A3',
        'custom-bg-gray': '#EBEBEB',
        'custom-sidebar-hover': '#FF3480',
        'custom-light-pink': '#FFF4F8',
        'custom-lite-gray': '#F4F4F4',

        // Primary colors
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

        // Secondary colors
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
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mukta: ['Mukta Vaani', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 1s ease-in-out',
        'slide-in-left': 'slide-in-left 0.8s ease-out',
        'slide-in-right': 'slide-in-right 0.8s ease-out',
        'bounce': 'bounce 2s infinite',
        'pulse': 'pulse 2s infinite',
        'shake': 'shake 0.8s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
        'node-pulse': 'node-pulse 2s ease-in-out infinite',
        'node-float': 'node-float 3s ease-in-out infinite',
        'node-glow': 'node-glow 2s ease-in-out infinite',
        'node-shake': 'node-shake 0.5s ease-in-out infinite',
        'node-rotate': 'node-rotate 4s linear infinite',
        'node-bounce': 'node-bounce 2s infinite',
        'edge-flow': 'edge-flow 1s linear infinite',
        'edge-pulse': 'edge-pulse 2s ease-in-out infinite',
        'edge-glow': 'edge-glow 2s ease-in-out infinite',
        'edge-dash-flow': 'edge-dash-flow 1s linear infinite',
      },
    },
  },
  plugins: [],
  // Prevent Tailwind from conflicting with Material-UI
  corePlugins: {
    preflight: false,
  },
};
