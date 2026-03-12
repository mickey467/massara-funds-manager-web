/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B2500',
          light: '#a02900',
          dark: '#6B1D00',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#C9A961',
        },
        cream: {
          DEFAULT: '#faf8f5',
          dark: '#f0ebe3',
        },
      },
      fontFamily: {
        arabic: ['"Traditional Arabic"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
