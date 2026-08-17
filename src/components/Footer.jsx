import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const Footer = () => {
  return (
    <footer className="bg-cafe-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Hotel Angeles</h3>
            <p className="text-sm opacity-80">Su confortabilidad es nuestra prioridad</p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <MapPin size={16} /> Cjon Álvaro Obregon y 21, San Luis Río Colorado
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} /> +52 653-518-3169
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} /> +52 653-187-4865
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} /> hotelangeles_21@hotmail.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-3">Enlaces</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/" onClick={scrollToTop} className="hover:opacity-100">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/rooms" onClick={scrollToTop} className="hover:opacity-100">
                  Habitaciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-3">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/terms" onClick={scrollToTop} className="hover:opacity-100">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacy" onClick={scrollToTop} className="hover:opacity-100">
                  Aviso de Privacidad
                </Link>
              </li>

            </ul>
          </div>
        </div>

        <div className="border-t border-beige-50/20 mt-8 pt-6 text-center text-sm opacity-60">
          © 2026 Hotel Angeles - San Luis Río Colorado, Sonora.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

