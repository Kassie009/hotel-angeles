import { useState } from 'react';
import cardValidator from 'card-validator';

const StripeCheckout = ({ total, onSuccess, onError }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    const numberValidation = cardValidator.number(cardNumber);
    if (!numberValidation.isValid) newErrors.cardNumber = 'Número de tarjeta inválido';
    
    const expiryValidation = cardValidator.expirationDate(cardExpiry);
    if (!expiryValidation.isValid) newErrors.cardExpiry = 'Fecha inválida (MM/AA)';
    
    const cvcValidation = cardValidator.cvv(cardCvc);
    if (!cvcValidation.isValid) newErrors.cardCvc = 'CVV inválido (3-4 dígitos)';
    
    if (!cardName.trim()) newErrors.cardName = 'Nombre del titular requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    // Simular procesamiento de Stripe (2 segundos)
    setTimeout(() => {
      // Simular éxito 95% del tiempo
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        const paymentIntent = {
          id: `pi_${Date.now()}`,
          amount: total * 100,
          currency: 'mxn',
          status: 'succeeded',
          card: {
            brand: cardValidator.number(cardNumber).card?.type || 'visa',
            last4: cardNumber.slice(-4)
          }
        };
        onSuccess(paymentIntent);
      } else {
        onError('El pago fue rechazado. Intenta con otra tarjeta.');
      }
      
      setProcessing(false);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">💳</div>
        <h3 className="font-bold text-cafe-900">Pago con Tarjeta</h3>
        <div className="flex gap-1 ml-auto">
          <span className="text-xs text-cafe-100">💳 Visa</span>
          <span className="text-xs text-cafe-100">💳 Mastercard</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-cafe-900 text-sm font-medium mb-1">Número de tarjeta</label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className={`input ${errors.cardNumber ? 'border-error' : ''}`}
          />
          {errors.cardNumber && <p className="text-error text-xs mt-1">{errors.cardNumber}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-cafe-900 text-sm font-medium mb-1">Fecha (MM/AA)</label>
            <input
              type="text"
              placeholder="12/28"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              className={`input ${errors.cardExpiry ? 'border-error' : ''}`}
            />
            {errors.cardExpiry && <p className="text-error text-xs mt-1">{errors.cardExpiry}</p>}
          </div>
          <div>
            <label className="block text-cafe-900 text-sm font-medium mb-1">CVV</label>
            <input
              type="text"
              placeholder="123"
              value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              maxLength={4}
              className={`input ${errors.cardCvc ? 'border-error' : ''}`}
            />
            {errors.cardCvc && <p className="text-error text-xs mt-1">{errors.cardCvc}</p>}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-cafe-900 text-sm font-medium mb-1">Titular de la tarjeta</label>
          <input
            type="text"
            placeholder="JUAN PEREZ"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            className={`input ${errors.cardName ? 'border-error' : ''}`}
          />
          {errors.cardName && <p className="text-error text-xs mt-1">{errors.cardName}</p>}
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-cafe-100">🔒 Pago seguro con Stripe</span>
            <span className="text-cafe-100">💰 Total: ${total.toFixed(2)} MXN</span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={processing}
          className={`w-full btn-primary py-3 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {processing ? 'Procesando...' : `Pagar $${total.toFixed(2)} MXN`}
        </button>
      </form>
    </div>
  );
};

export default StripeCheckout;