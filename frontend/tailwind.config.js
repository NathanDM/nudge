/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: 'rgb(214, 189, 152)',
        sage: 'rgb(103, 125, 106)',
        'dark-sage': 'rgb(64, 83, 76)',
        teal: 'rgb(26, 54, 54)',
      },
    },
  },
  plugins: [],
};
