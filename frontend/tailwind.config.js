/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#FEF8F3',
        blush: '#EED7CF',
        sage: '#A5C8BF',
        active: '#2D8C85',
        salmon: '#E9ACB2',
        inkSoft: '#6B5F57',
        inkMute: '#A39890',
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
