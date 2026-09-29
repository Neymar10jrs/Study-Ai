/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        foreground: '#f3f4f6',
        surface: {
          DEFAULT: '#11131c',
          raised: '#171a27',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.04)',
        },
        primary: {
          DEFAULT: '#f97316', // Orange 500
          hover: '#ea580c', // Orange 600
          light: '#fb923c', // Orange 400
          dark: '#c2410c', // Orange 700
          foreground: '#ffffff',
        },
        amber: {
          accent: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        yellow: {
          accent: '#eab308',
        },
        accent: {
          DEFAULT: '#fb923c',
          muted: '#7c2d12',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(249, 115, 22, 0.25)',
        'glow-md': '0 0 25px -4px rgba(249, 115, 22, 0.35)',
        'glow-lg': '0 0 40px -5px rgba(249, 115, 22, 0.45)',
        'glow-amber': '0 0 30px -4px rgba(245, 158, 11, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
