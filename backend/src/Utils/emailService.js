import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendConfirmationEmail = async ({ 
  email, 
  nombre, 
  codigo, 
  checkIn, 
  checkOut, 
  habitacion, 
  total 
}) => {
  try {
    console.log('Intentando enviar correo a:', email);
    
    const mailOptions = {
      from: `"Hotel Angeles" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Reserva Confirmada - ${codigo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #faf8f6;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #5C4033; text-align: center; margin-bottom: 20px;">¡Reserva Confirmada!</h2>
            <p style="font-size: 16px;">Hola <strong>${nombre}</strong>,</p>
            <p style="font-size: 16px;">Tu reserva ha sido confirmada exitosamente. ¡Gracias por elegirnos!</p>
            
            <div style="background: #f5f0eb; padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h3 style="color: #5C4033; margin-top: 0;">Detalles de tu reserva</h3>
              <p><strong>Código:</strong> <span style="color: #5C4033; font-weight: bold;">${codigo}</span></p>
              <p><strong>Habitación:</strong> ${habitacion}</p>
              <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Check-out:</strong> ${new Date(checkOut).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Total pagado:</strong> <span style="font-size: 18px; font-weight: bold; color: #5C4033;">$${total.toFixed(2)}</span></p>
            </div>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <p style="margin: 0; color: #2e7d32;">Pago confirmado. ¡Te esperamos en Hotel Angeles!</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            
            <p style="font-size: 14px; color: #8B7355; text-align: center;">
              Hotel Angeles - Su confortabilidad es nuestra prioridad<br>
              <a href="${process.env.FRONTEND_URL}" style="color: #5C4033;">${process.env.FRONTEND_URL}</a>
            </p>
            <p style="font-size: 12px; color: #999; text-align: center;">Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return info;

  } catch (error) {
    console.error('Error al enviar correo:', error.message);
    return null;
  }
};