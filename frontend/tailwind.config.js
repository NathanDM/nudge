/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#FEF8F3',
        sage: '#EED7CF',
        'dark-sage': '#A5C8BF',
        teal: '#E9ACB2',
      },
    },
  },
  plugins: [],
};
