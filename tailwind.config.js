/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf7f0',
          100: '#faebd7',
          200: '#f5d5ae',
          300: '#edb374',
          400: '#e39142',
          500: '#d97706',
          600: '#c2410c',
          700: '#9a3412',
          800: '#7c2d12',
          900: '#651c0e',
        }
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'glass-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05))',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}