const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: (process.env.EMAIL_PASS || '').replace(/\s/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendConfirmationEmail = async ({ 
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
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #1E3A8A; padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Hotel Angeles</h1>
            <p style="margin: 6px 0 0; color: #BFDBFE; font-size: 13px;">Su confortabilidad es nuestra prioridad</p>
          </div>

          <div style="padding: 32px;">
            <h2 style="color: #1E3A8A; margin: 0 0 16px; font-size: 20px;">¡Reserva Confirmada!</h2>
            <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 8px;">Hola <strong>${nombre}</strong>,</p>
            <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 24px;">Tu reserva ha sido confirmada exitosamente. ¡Gracias por elegirnos!</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #F8FAFF; border: 1px solid #EFF6FF;">
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 13px; color: #666; width: 40%;">Código</td><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 14px; color: #1E3A8A; font-weight: 600;">${codigo}</td></tr>
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 13px; color: #666;">Habitación</td><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 14px; color: #333;">${habitacion}</td></tr>
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 13px; color: #666;">Check-in</td><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 14px; color: #333;">${new Date(checkIn).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 13px; color: #666;">Check-out</td><td style="padding: 14px 16px; border-bottom: 1px solid #EFF6FF; font-size: 14px; color: #333;">${new Date(checkOut).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td style="padding: 14px 16px; font-size: 13px; color: #666;">Total pagado</td><td style="padding: 14px 16px; font-size: 16px; color: #4169E1; font-weight: 700;">$${total.toFixed(2)}</td></tr>
            </table>

            <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0 0 28px;">Pago confirmado. ¡Te esperamos en Hotel Angeles!</p>

            <hr style="border: none; border-top: 1px solid #EFF6FF; margin: 24px 0;" />

            <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0 0 4px;"><strong>¿Necesitas cancelar tu reserva?</strong></p>
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 20px;">Por favor llama al <a href="tel:+526535183169" style="color: #4169E1;">+52 653-518-3169</a> o <a href="tel:+526531874865" style="color: #4169E1;">+52 653-187-4865</a>.</p>

            <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0 0 4px;"><strong>¿Requieres factura?</strong></p>
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 28px;">Envía tus datos fiscales a <a href="mailto:hotelangeles_21@hotmail.com" style="color: #4169E1;">hotelangeles_21@hotmail.com</a> para generarla.</p>

            <hr style="border: none; border-top: 1px solid #EFF6FF; margin: 24px 0;" />

            <p style="font-size: 13px; color: #888; text-align: center; line-height: 1.6; margin: 0;">
              Este es un correo automático, por favor no responder.
            </p>
          </div>

          <div style="background: #EFF6FF; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #1E3A8A;">Hotel Angeles &copy; ${new Date().getFullYear()}</p>
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

const sendCancellationEmail = async ({
  email,
  nombre,
  codigo,
  checkIn,
  checkOut,
  habitacion,
  total,
  reembolso
}) => {
  try {
    const reembolsoNum = Number(reembolso) || 0;
    const totalNum = Number(total) || 0;

    const mailOptions = {
      from: `"Hotel Angeles" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Reserva Cancelada - ${codigo}`,
html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #1E3A8A; padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Hotel Angeles</h1>
            <p style="margin: 6px 0 0; color: #BFDBFE; font-size: 13px;">Su confortabilidad es nuestra prioridad</p>
          </div>

          <div style="padding: 32px;">
            <h2 style="color: #DC2626; margin: 0 0 16px; font-size: 20px;">Reserva Cancelada</h2>
            <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 8px;">Hola <strong>${nombre}</strong>,</p>
            <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 24px;">Tu reserva ha sido cancelada exitosamente.</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #FEF2F2; border: 1px solid #FECACA;">
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 13px; color: #666; width: 40%;">Código</td><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 14px; color: #1E3A8A; font-weight: 600;">${codigo}</td></tr>
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 13px; color: #666;">Habitación</td><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 14px; color: #333;">${habitacion}</td></tr>
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 13px; color: #666;">Check-in</td><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 14px; color: #333;">${new Date(checkIn).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 13px; color: #666;">Check-out</td><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 14px; color: #333;">${new Date(checkOut).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 13px; color: #666;">Total original</td><td style="padding: 14px 16px; border-bottom: 1px solid #FECACA; font-size: 14px; color: #333;">$${totalNum.toFixed(2)}</td></tr>
              <tr><td style="padding: 14px 16px; font-size: 13px; color: #666;">Reembolso</td><td style="padding: 14px 16px; font-size: 16px; color: ${reembolsoNum > 0 ? '#16A34A' : '#DC2626'}; font-weight: 700;">$${reembolsoNum.toFixed(2)} MXN</td></tr>
            </table>

            ${reembolsoNum > 0 ? `
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 14px; color: #166534; line-height: 1.6; margin: 0 0 8px;"><strong>Detalles del reembolso:</strong></p>
              <p style="font-size: 14px; color: #166534; line-height: 1.6; margin: 0;">Se realizará un reembolso de <strong>$${reembolsoNum.toFixed(2)} MXN</strong>. Para coordinar la devolución del monto, por favor comunícate con nosotros a los teléfonos:</p>
              <p style="font-size: 15px; color: #1E3A8A; font-weight: 600; margin: 12px 0 4px;">
                <a href="tel:+526535183169" style="color: #1E3A8A;">+52 653-518-3169</a>
              </p>
              <p style="font-size: 15px; color: #1E3A8A; font-weight: 600; margin: 0;">
                <a href="tel:+526531874865" style="color: #1E3A8A;">+52 653-187-4865</a>
              </p>
            </div>
            ` : `
            <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 14px; color: #991B1B; line-height: 1.6; margin: 0;">De acuerdo con la política de cancelación, no aplica reembolso ya que la cancelación se realizó con menos de 24 horas de anticipación al check-in.</p>
            </div>
            `}

            <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0 0 4px;"><strong>¿Tienes dudas?</strong></p>
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 28px;">Llama al <a href="tel:+526535183169" style="color: #4169E1;">+52 653-518-3169</a> o <a href="tel:+526531874865" style="color: #4169E1;">+52 653-187-4865</a>.</p>

            <hr style="border: none; border-top: 1px solid #EFF6FF; margin: 24px 0;" />

            <p style="font-size: 13px; color: #888; text-align: center; line-height: 1.6; margin: 0;">
              Este es un correo automático, por favor no responder.
            </p>
          </div>

          <div style="background: #EFF6FF; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #1E3A8A;">Hotel Angeles &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error al enviar correo de cancelación:', error.message);
    return null;
  }
};

module.exports = { sendConfirmationEmail, sendCancellationEmail };