- [ ] Confirmar que el backend usa MySQL (no Prisma) para el flujo de confirmación.
- [ ] Limpiar/retirar `backend/src/Routes/admin-reservations.js` (si no está registrado en `backend/src/Index.js`) y `backend/src/Validators/prisma/schema.prisma`.
- [ ] Implementar envío de correo automático cuando se confirme una reserva desde el endpoint real usado por Admin/Recepción:
  - Archivo: `backend/src/Controllers/reservationController.js`
  - Modificar función `updateStatus`
  - Si `estado === 'confirmada'`: invocar `sendConfirmationEmail` de `backend/src/Utils/emailService.js`.
- [ ] Validar que el correo use los campos correctos de la reserva MySQL (nombre, email, check_in/out, habitacion, total/campos equivalentes).
- [ ] Ejecutar el servidor y probar confirmación (ver logs de envío de correo).

