import Breadcrumbs from '../components/Breadcrumbs';

const Terms = () => {
  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-6">Términos y Condiciones</h1>
          <p className="text-cafe-100 mb-6">Última actualización: 27 de junio de 2026</p>
          
          <div className="space-y-6 text-cafe-100">
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">1. Aceptación de los términos</h2>
              <p>Al realizar una reserva en Hotel Ángeles, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no deberá realizar una reserva en nuestro sitio web.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">2. Reservaciones</h2>
              <p>Las reservaciones están sujetas a disponibilidad. Hotel Angeles se reserva el derecho de rechazar cualquier reserva por cualquier motivo. Todas las reservas requieren un pago por transferencia bancaria para su confirmación.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">3. Política de Cancelación</h2>
              <p>Si deseas cancelar una reservación, comunícate directamente con el hotel al teléfono (653) 518-3169 o (653) 187-4865. El personal verificará el estado de tu reservación y te informará sobre el procedimiento correspondiente..</p>
              <p className="mt-2">Las solicitudes de cancelación están sujetas a la revisión y autorización del hotel..</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">4. Check-in / Check-out</h2>
              <p>El horario de check-in es a partir de las <strong>1:00 PM</strong>. El horario de check-out es antes de las <strong>11:00 AM</strong>.</p>
              <p className="mt-2">Se otorga 1 hora de tolerancia para retirarse después del check-out.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">5. Mascotas</h2>
              <p>Se aceptan mascotas con un costo adicional de:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>$15 USD</strong> por mascota pequeña por día</li>
                <li><strong>$30 USD</strong> por mascota grande por día</li>
                <li>Los pagos por mascota se realizan en recepción.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">6. Responsabilidad del huésped</h2>
              <p>El huésped es responsable por cualquier daño causado a la habitación o a las instalaciones del hotel durante su estancia. Hotel Angeles se reserva el derecho de cobrar los costos de reparación o reemplazo.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">7. Pago</h2>
              <p>El pago de la reserva debe realizarse mediante <strong>transferencia bancaria</strong> a las cuentas proporcionadas en la confirmación de la reserva.</p>
              <p className="mt-2">Una vez realizada la transferencia, el huésped debe enviar el comprobante al correo <strong>reservas.hotelangeles@gmail.com</strong> para confirmar su reserva.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">8. Modificaciones</h2>
              <p>Hotel Angeles se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">9. Contacto</h2>
              <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en:</p>
              <p className="mt-2">hotelangeles_21@hotmail.com</p>
              <p>+52 653 518 3169</p>
              <p>+52 653 187 4865</p>
              <p>Cjon. Álvaro Obregón y 21, San Luis Río Colorado, Sonora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;