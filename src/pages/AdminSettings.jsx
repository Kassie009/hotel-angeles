import { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const AdminSettings = () => {
  const [hotelName, setHotelName] = useState('Prestige Inn');
  const [hotelEmail, setHotelEmail] = useState('contacto@prestigeinn.com');
  const [hotelPhone, setHotelPhone] = useState('+52 653 123 4567');
  const [hotelAddress, setHotelAddress] = useState('Av. Álvaro Obregón 456, San Luis Río Colorado, Sonora');

  const handleSave = () => {
    // Aquí se guardarían los cambios en localStorage o backend
    alert('Configuración guardada (simulación)');
  };

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Administración del Hotel</h1>
          <p className="text-cafe-100">Configuración general y ajustes del sistema</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-cafe-900 mb-4">Configuración General</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-cafe-900 text-sm font-medium mb-1">Nombre del Hotel</label>
              <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-cafe-900 text-sm font-medium mb-1">Correo de Contacto</label>
              <input type="email" value={hotelEmail} onChange={(e) => setHotelEmail(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-cafe-900 text-sm font-medium mb-1">Teléfono</label>
              <input type="text" value={hotelPhone} onChange={(e) => setHotelPhone(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-cafe-900 text-sm font-medium mb-1">Dirección</label>
              <textarea value={hotelAddress} onChange={(e) => setHotelAddress(e.target.value)} rows="3" className="input" />
            </div>
            <button onClick={handleSave} className="btn-primary w-full mt-4">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;