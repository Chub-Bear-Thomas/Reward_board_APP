/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#f5ead4',
          200: '#eddcb8',
          300: '#dcc899',
          400: '#c4a86e',
          500: '#a8894e',
          600: '#8b6d38',
          700: '#6e5428',
          800: '#523e1e',
          900: '#3a2b14',
        },
        wood: {
          50: '#f7f0e8',
          100: '#e8d4bd',
          200: '#d4b896',
          300: '#b8946d',
          400: '#9c7548',
          500: '#7a5a33',
          600: '#5e4427',
          700: '#4a3520',
          800: '#372818',
          900: '#241a10',
        },
        guild: {
          gold: '#c9a84c',
          darkGold: '#a8894e',
          crimson: '#8b2252',
          darkCrimson: '#6b1a3f',
          velvet: '#4a1035',
          emerald: '#2d6b3f',
          bronze: '#cd7f32',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Noto Serif JP"', 'Georgia', 'serif'],
        gothic: ['"Cinzel Decorative"', '"Noto Serif SC"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(201, 168, 76, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(201, 168, 76, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
