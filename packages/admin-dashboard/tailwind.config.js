/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Greyscale Color Palette
        grey: {
          50: '#fafafa',    // Lightest backgrounds
          100: '#f5f5f5',   // Very light backgrounds
          150: '#e5e5e5',   // Light backgrounds
          200: '#e4e4e4',   // Light borders
          250: '#d4d4d4',   // Subtle backgrounds
          300: '#cfcfcf',   // Muted backgrounds
          400: '#a3a3a3',   // Medium grey backgrounds
          500: '#737373',   // Medium grey
          600: '#525252',   // Dark grey text
          700: '#404040',   // Dark grey
          800: '#303030',   // Very dark grey
          900: '#1a1a1a',   // Almost black
          950: '#0d0d0d',   // Nearly black
          980: '#080808',   // Pure black
          DEFAULT: '#404040', // Default grey
        },

        // Semantic color mappings (all grey-scale)
        primary: {
          DEFAULT: '#404040',
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#cfcfcf',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#303030',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },

        success: {
          DEFAULT: '#404040',
          light: '#e5e5e5',
          medium: '#737373',
          dark: '#1a1a1a',
        },

        warning: {
          DEFAULT: '#404040',
          light: '#e5e5e5',
          medium: '#737373',
          dark: '#1a1a1a',
        },

        danger: {
          DEFAULT: '#404040',
          light: '#e5e5e5',
          medium: '#737373',
          dark: '#1a1a1a',
        },

        // UI colors (all greyscale)
        background: {
          DEFAULT: '#ffffff',
          dark: '#080808',
          card: '#ffffff',
          'card-dark': '#1a1a1a',
          hover: '#f5f5f5',
          'hover-dark': '#252525',
        },

        text: {
          DEFAULT: '#404040',
          primary: '#080808',
          secondary: '#525252',
          muted: '#737373',
          'muted-light': '#a3a3a3',
          light: '#9ca3af',
          lighter: '#d4d4d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 8px 0 rgba(0, 0, 0, 0.08)',
        'large': '0 12px 24px 0 rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
