# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

//FUNCIÓN ASÍNCRONA #1
// Archivo: src/pages/Booking.jsx
// Líneas: 48-66
// 
// Descripción: Obtiene los datos de una habitación específica desde el backend
// utilizando el ID de la habitación que viene en la URL.
// 
// Cómo funciona:
// 1. Hace una petición GET a `${API_URL}/rooms/${id}`
// 2. Espera (await) la respuesta del servidor
// 3. Convierte la respuesta a JSON
// 4. Guarda los datos en el estado `room`


//FUNCIÓN ASÍNCRONA #2
// Archivo: src/pages/Booking.jsx
// Líneas: 109-157
// 
// Descripción: Envía los datos de la reserva al backend para guardarlos en la base de datos.
// 
// Cómo funciona:
// 1. Valida las fechas seleccionadas
// 2. Calcula noches, subtotal, IVA y total
// 3. Construye el objeto `reserva`
// 4. Hace una petición POST a `${API_URL}/reservations`
// 5. Espera la respuesta del servidor
// 6. Si es exitosa, guarda la reserva y redirige a confirmación

//FUNCIÓN ASÍNCRONA #3
// Archivo: src/pages/Confirmation.jsx
// Líneas: 16-31
// 
// Descripción: Obtiene los detalles de una reserva usando el código que viene en la URL.
// 
// Cómo funciona:
// 1. Toma el `codigo` de los parámetros de la URL
// 2. Hace una petición GET a `${API_URL}/reservations/${codigo}`
// 3. Espera la respuesta del servidor
// 4. Convierte la respuesta a JSON
// 5. Guarda los datos en el estado `reserva`


//FUNCIÓN ASÍNCRONA #4
// Archivo: src/pages/AdminRooms.jsx
// Líneas: 27-44
// 
// Descripción: Carga todas las habitaciones desde el backend para mostrarlas en el panel de administración.
// 
// Cómo funciona:
// 1. Obtiene el token JWT desde localStorage
// 2. Hace una petición GET a `${API_URL}/rooms`
// 3. Incluye el token en el header `Authorization`
// 4. Espera la respuesta del servidor
// 5. Convierte la respuesta a JSON
// 6. Guarda los datos en el estado `habitaciones`


//FUNCIÓN ASÍNCRONA #5
// Archivo: src/pages/Rooms.jsx (o Home.jsx)
// Líneas: 38-52
// 
// Descripción: Carga todas las habitaciones desde el backend para mostrarlas en la página principal.
// 
// Cómo funciona:
// 1. Hace una petición GET a `${API_URL}/rooms`
// 2. Espera la respuesta del servidor
// 3. Convierte la respuesta a JSON
// 4. Guarda los datos en el estado `habitaciones` y `filteredRooms`
