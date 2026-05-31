/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Russo One', 'sans-serif'],
      },
      colors: {
        yellow: {
          300: '#fde047',
          400: '#facc15',
          500: '#F5C518',
          600: '#eab308',
          700: '#ca8a04',
        },
      },
    },
  },
  plugins: [],
}