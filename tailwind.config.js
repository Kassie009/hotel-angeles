/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema blanco + azul rey (royal blue)
        beige: {
          50: '#FFFFFF',   // blanco puro - fondo de página/tarjetas
          100: '#E0ECFB',  // azul muy claro - tarjetas secundarias, breadcrumbs
          200: '#B3CFF0',  // azul suave - bordes
        },
        cafe: {
          50: '#9CBFE6',   // azul claro - texto/bordes sutiles
          100: '#1E40AF',  // azul (blue-800) - texto secundario, hover
          200: '#1D4ED8',  // AZUL (blue-700) - botones principales
          700: '#1E40AF',  // azul (blue-800) - gradiente login
          900: '#172554',  // azul oscuro (blue-950) - navbar, footer, títulos
        },
        exito: '#5D7B6F',
        error: '#C05A4B',
      },
    },
  },
  plugins: [],
}
