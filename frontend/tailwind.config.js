/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#ede9e0',
          200: '#d9d0be',
          300: '#c0b49a',
          400: '#a89374',
          500: '#8f7355',
          600: '#6f5640',
          700: '#503d2d',
          800: '#35271c',
          900: '#1a130d',
        },
        accent: {
          DEFAULT: '#c9472d',
          light: '#e8604a',
          dark: '#9e3320',
        },
      },
    },
  },
  plugins: [],
}