import Breadcrumbs from '../components/Breadcrumbs';

const Terms = () => {
  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-6">Términos y Condiciones</h1>
          <p className="text-cafe-100 mb-6">Última actualización: 27 de mayo de 2026</p>
          
          <div className="space-y-6 text-cafe-100">
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">1. Aceptación de los términos</h2>
              <p>Al realizar una reserva en Prestige Inn, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no deberá realizar una reserva en nuestro sitio web.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">2. Reservaciones</h2>
              <p>Las reservaciones están sujetas a disponibilidad. Prestige Inn se reserva el derecho de rechazar cualquier reserva por cualquier motivo. Al realizar una reservación se generan cargos de procesamiento equivalentes aproximadamente al 10% del total de la transacción.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">3. Política de Cancelación</h2>
              <p>Las cancelaciones realizadas con más de 7 días de anticipación al check-in tienen derecho a un reembolso del 100% del valor de la habitación.</p>
              <p className="mt-2">Las cancelaciones realizadas entre 2 y 7 días antes del check-in tienen derecho a un reembolso del 50% del valor de la habitación.</p>
              <p className="mt-2">Las cancelaciones realizadas con menos de 48 horas de anticipación no tienen derecho a reembolso.</p>
              <p className="mt-2 font-semibold text-cafe-900">Los cargos de operación del 10% NO son reembolsables en ningún caso.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">4. Check-in / Check-out</h2>
              <p>El horario de check-in es a partir de las 15:00 horas. El horario de check-out es antes de las 12:00 horas. Late check-out sujeto a disponibilidad con un costo adicional de $350 MXN.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">5. Responsabilidad del huésped</h2>
              <p>El huésped es responsable por cualquier daño causado a la habitación o a las instalaciones del hotel durante su estancia. Prestige Inn se reserva el derecho de cobrar los costos de reparación o reemplazo.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">6. Pago</h2>
              <p>El pago total de la reserva debe realizarse al momento de confirmar la reserva. Aceptamos pagos con tarjeta de crédito/débito a través de Stripe. Para reservas en sitio, aceptamos efectivo, transferencia bancaria o tarjeta.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">7. Modificaciones</h2>
              <p>Prestige Inn se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">8. Contacto</h2>
              <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en:</p>
              <p className="mt-2">📧 contacto@prestigeinn.com</p>
              <p>📞 +52 653 123 4567</p>
              <p>📍 Av. Álvaro Obregón 456, San Luis Río Colorado, Sonora. CP 83400</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;