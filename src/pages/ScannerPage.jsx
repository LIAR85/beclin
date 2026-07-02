import { useState } from 'react';
import QrScanner from '../components/QrScanner';
import { useMarkOrderCompleted } from '../hooks/useMarkOrderCompleted';

export default function ScannerPage() {
  const markCompleted = useMarkOrderCompleted();
  const [message, setMessage] = useState('');

  const onOrderDetected = async (value) => {
    const orderId = Number(value);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      setMessage('QR invalido. Se esperaba un ID numerico de pedido.');
      return;
    }

    try {
      await markCompleted.mutateAsync(orderId);
      setMessage(`Pedido ${orderId} marcado como completed.`);
    } catch (error) {
      setMessage(error.message || 'No se pudo actualizar el pedido.');
    }
  };

  return (
    <div className="space-y-4">
      <QrScanner onOrderDetected={onOrderDetected} loading={markCompleted.isPending} />

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        {message || 'Escanea un ticket para actualizar estado.'}
      </div>
    </div>
  );
}
