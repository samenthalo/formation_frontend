/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        lora: ['Lora', 'serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        primary: '#5fa7f1',
        secondary: '#6c757d',
        background: '#F6F4F4',
        error: '#dc3545',
        success: '#28a745',
      },
    },
  },
  plugins: [],
};