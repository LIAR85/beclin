import { useState } from 'react';
import { motion } from 'framer-motion';
import OrderForm from '../components/OrderForm';
import TicketCard from '../components/TicketCard';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useConnectivity } from '../hooks/useConnectivity';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

export default function DashboardPage() {
  const { isOnline } = useConnectivity();
  const { enqueue, queueCount } = useOfflineQueue();
  const createOrder = useCreateOrder();
  const [lastTicket, setLastTicket] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const onSubmit = async (formValues) => {
    if (!isOnline) {
      const localItem = enqueue(formValues);
      setLastTicket({
        id: localItem.localId,
        client_name: formValues.fullName,
        service_type: formValues.serviceType,
        service_mode: String(formValues.serviceMode || 'Regular').toLowerCase(),
        quantity: formValues.quantity,
        status: 'pending_offline',
      });
      setFeedback({
        type: 'warning',
        message: `Pedido guardado sin internet. Se sincronizara al volver la conexion. Ref: ${localItem.localId}`,
      });
      return true;
    }

    try {
      const result = await createOrder.mutateAsync(formValues);
      setLastTicket(result);
      setFeedback({
        type: 'success',
        message: `Pedido ${result.id} generado correctamente para ${result.client_name}.`,
      });
      return true;
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'No se pudo crear el pedido en Supabase.',
      });
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <OrderForm onSubmit={onSubmit} loading={createOrder.isPending} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          Pendientes por sincronizar: <strong>{queueCount}</strong>
        </div>
      </motion.div>

      {feedback.message && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div
            className={`rounded-xl px-3 py-2 text-sm ${
              feedback.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : feedback.type === 'warning'
                  ? 'border border-amber-200 bg-amber-50 text-amber-800'
                  : 'border border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {feedback.message}
          </div>
        </motion.div>
      )}

      {lastTicket && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <TicketCard order={lastTicket} />
        </motion.div>
      )}
    </div>
  );
}
