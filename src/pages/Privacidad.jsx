import Breadcrumbs from '../components/Breadcrumbs';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Aviso de Privacidad</h1>
          <p className="text-gray-700 mb-6">Última actualización: 11 de agosto de 2026</p>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Responsable del tratamiento</h2>
              <p>Hotel Angeles, con domicilio en Cjon. Álvaro Obregón y 21, San Luis Río Colorado, Sonora, es el responsable del tratamiento de sus datos personales.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Datos personales que recopilamos</h2>
              <p>Para realizar una reserva, recopilamos los siguientes datos personales:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Nombre completo</li>
                <li>Correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Fechas de estancia</li>
                <li>Preferencias de habitación</li>
                <li>Número de huéspedes</li>
              </ul>
              <p className="mt-2 text-sm text-gray-700">No almacenamos información de tarjetas de crédito/débito, ya que los pagos se realizan mediante transferencia bancaria.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Finalidad del tratamiento</h2>
              <p>Sus datos personales serán utilizados para las siguientes finalidades:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Procesar y gestionar su reserva</li>
                <li>Enviar confirmaciones de su estancia</li>
                <li>Responder a sus preguntas y solicitudes</li>
                <li>Mejorar nuestros servicios y su experiencia como huésped</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Transferencia de datos</h2>
              <p>No compartimos sus datos personales con terceros, excepto cuando sea necesario por obligación legal. Sus datos son utilizados únicamente para la gestión de su reserva en Hotel Angeles.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Seguridad de los datos</h2>
              <p>Implementamos medidas de seguridad técnicas y administrativas para proteger sus datos personales contra acceso no autorizado, pérdida o alteración.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Derechos ARCO</h2>
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Acceder</strong> a sus datos personales</li>
                <li><strong>Rectificar</strong> sus datos si son inexactos</li>
                <li><strong>Cancelar</strong> sus datos (sujeto a políticas de cancelación)</li>
                <li><strong>Oponerse</strong> al uso de sus datos para fines específicos</li>
              </ul>
              <p className="mt-2">Para ejercer sus derechos ARCO, envíe una solicitud a <strong>hotelangeles@hotmail.com</strong></p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cambios al aviso de privacidad</h2>
              <p>Nos reservamos el derecho de actualizar este aviso de privacidad en cualquier momento. Cualquier cambio será publicado en esta página con la fecha de actualización correspondiente.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contacto</h2>
              <p>Si tiene preguntas sobre este Aviso de Privacidad, puede contactarnos en:</p>
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

export default Privacy;