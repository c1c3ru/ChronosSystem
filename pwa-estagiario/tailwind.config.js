/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          600: '#059669',
        },
        background: '#0F172A',
        surface: '#0B1220',
      },
    },
  },
  plugins: [],
};
