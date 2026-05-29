/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#F5E6D3',
          100: '#E8D5BD',
          200: '#D7C4A8',
        },
        cafe: {
          50: '#8D6E63',
          100: '#6D4C41',
          200: '#4E342E',
          900: '#3E2723',
        },
        exito: '#5D7B6F',
        error: '#C05A4B',
      },
    },
  },
  plugins: [],
}