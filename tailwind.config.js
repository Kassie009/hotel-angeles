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
          100: '#EBF3FF',  // azul muy claro - tarjetas secundarias, breadcrumbs
          200: '#BFD9F5',  // azul suave - bordes
        },
        cafe: {
          50: '#A8C7EC',   // azul claro - texto/bordes sutiles
          100: '#1D4ED8',  // azul (blue-700) - texto secundario, hover
          200: '#4169E1',  // AZUL REY (royal blue) - botones principales
          700: '#1D4ED8',  // azul (blue-700) - gradiente login
          900: '#1E3A8A',  // azul oscuro (blue-900) - navbar, footer, títulos
        },
        exito: '#5D7B6F',
        error: '#C05A4B',
      },
    },
  },
  plugins: [],
}
