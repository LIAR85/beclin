/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9ff',
          100: '#dff1ff',
          500: '#63b9ea',
          700: '#2c89c7',
          900: '#1d5f8d',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(44, 137, 199, 0.16)',
      },
    },
  },
  plugins: [],
};
