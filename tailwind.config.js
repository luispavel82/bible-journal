/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f4dca8',
          300: '#ecc46a',
          400: '#e4a83a',
          500: '#d4891f',
          600: '#b86a16',
          700: '#964f15',
          800: '#7a4017',
          900: '#653617',
        },
      }
    },
  },
  plugins: [],
}
