import { useState } from 'react';
import { QrReader } from 'react-qr-reader';

export default function QrScanner({ onOrderDetected, loading }) {
  const [lastValue, setLastValue] = useState('');

  const handleResult = async (result) => {
    if (!result) return;

    const qrValue = result?.text?.trim();
    if (!qrValue || qrValue === lastValue) return;

    setLastValue(qrValue);
    await onOrderDetected(qrValue);
  };

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Escanear pedido</h2>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={(result) => handleResult(result)}
          containerStyle={{ width: '100%' }}
          videoStyle={{ width: '100%' }}
          scanDelay={700}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600">
        {loading ? 'Marcando pedido como completado...' : 'Apunta la camara al QR del ticket.'}
      </p>
    </section>
  );
}
