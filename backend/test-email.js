import dotenv from 'dotenv';
import { sendConfirmationEmail } from './src/utils/emailService.js';

dotenv.config();

async function testEmail() {
  try {
    console.log('Probando envío de correo...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configurado' : 'No configurado');
    
   
    const result = await sendConfirmationEmail({
      email: process.env.EMAIL_USER, 
      nombre: 'Cliente Prueba',
      codigo: 'HA-20241225-00001',
      checkIn: new Date('2024-12-25'),
      checkOut: new Date('2024-12-28'),
      habitacion: 'Habitación Sencilla',
      total: 2550
    });
    
    if (result) {
      console.log('Correo de prueba enviado exitosamente');
    } else {
      console.log('El correo no se pudo enviar (error controlado)');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEmail();