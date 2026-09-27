/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8f4',
          100: '#e1f0e7',
          200: '#c3e0d0',
          300: '#97c8b0',
          400: '#64a98b',
          500: '#3e8b6e',
          600: '#2f6b4f', // Primary Warm Green
          700: '#275640',
          800: '#224535',
          900: '#1d392d',
          950: '#0f2019',
        },
        ochre: {
          50: '#fdf9ee',
          100: '#faf0d4',
          200: '#f4deaa',
          300: '#ecc676',
          400: '#e3ad47',
          500: '#d9a441', // Mustard / Ochre Accent
          600: '#bd7f27',
          700: '#955b21',
          800: '#7a4821',
          900: '#663c1f',
          950: '#3a1e0d',
        },
        earth: {
          50: '#fbf9f6',
          100: '#f5f0e9',
          200: '#ebe1d4',
          300: '#dccbb8',
          400: '#c7ae96',
          500: '#b6957a',
          600: '#a78267',
          700: '#8b6953',
          800: '#715646',
          900: '#5c473b',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
