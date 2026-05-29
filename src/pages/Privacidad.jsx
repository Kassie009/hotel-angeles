import Breadcrumbs from '../components/Breadcrumbs';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-6">Aviso de Privacidad</h1>
          <p className="text-cafe-100 mb-6">Última actualización: 27 de mayo de 2026</p>
          
          <div className="space-y-6 text-cafe-100">
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">1. Responsable del tratamiento</h2>
              <p>Prestige Inn, con domicilio en Av. Álvaro Obregón 456, San Luis Río Colorado, Sonora. CP 83400, es el responsable del tratamiento de sus datos personales.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">2. Datos personales que recopilamos</h2>
              <p>Para realizar una reserva, recopilamos los siguientes datos personales:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Nombre completo</li>
                <li>Correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Fechas de estancia</li>
                <li>Preferencias de habitación</li>
                <li>Información de pago (procesada a través de Stripe, no almacenamos datos de tarjetas)</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">3. Finalidad del tratamiento</h2>
              <p>Sus datos personales serán utilizados para las siguientes finalidades:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Procesar y gestionar su reserva</li>
                <li>Enviar confirmaciones y recordatorios de su estancia</li>
                <li>Responder a sus preguntas y solicitudes</li>
                <li>Mejorar nuestros servicios y su experiencia como huésped</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">4. Transferencia de datos</h2>
              <p>No compartimos sus datos personales con terceros, excepto cuando sea necesario para procesar pagos (Stripe) o por obligación legal. Stripe cumple con los más altos estándares de seguridad para el procesamiento de pagos.</p>
            </div>
            
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">5. Derechos ARCO</h2>
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Acceder</strong> a sus datos personales</li>
                <li><strong>Rectificar</strong> sus datos si son inexactos</li>
                <li><strong>Cancelar</strong> sus datos (sujeto a políticas de cancelación)</li>
                <li><strong>Oponerse</strong> al uso de sus datos para fines específicos</li>
              </ul>
              <p className="mt-2">Para ejercer sus derechos ARCO, envíe una solicitud a contacto@prestigeinn.com</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">6. Cambios al aviso de privacidad</h2>
              <p>Nos reservamos el derecho de actualizar este aviso de privacidad en cualquier momento. Cualquier cambio será publicado en esta página con la fecha de actualización correspondiente.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-3">7. Contacto</h2>
              <p>Si tiene preguntas sobre este Aviso de Privacidad, puede contactarnos en:</p>
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

export default Privacy;