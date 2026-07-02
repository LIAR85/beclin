import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';

export default function TicketCard({ order }) {
  const printRef = useRef(null);

  const printTicket = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ticket-${order.id}`,
  });

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <h3 className="mb-3 text-base font-semibold text-slate-900">Ultimo ticket</h3>

      <article
        ref={printRef}
        className="ticket-print-root mx-auto rounded-lg border border-dashed border-slate-400 bg-white p-4 text-slate-900"
        style={{ width: '80mm' }}
      >
        <p className="text-center text-lg font-bold">Be Clean</p>
        <p className="text-center text-xs">Ticket de servicio</p>
        <p className="mt-1 text-center text-[10px]">Fecha: {new Date().toLocaleString()}</p>

        <div className="mt-3 space-y-1 text-xs">
          <p>
            <strong>Pedido:</strong> {order.id}
          </p>
          <p>
            <strong>Cliente:</strong> {order.client_name}
          </p>
          <p>
            <strong>Servicio:</strong> {order.service_type}
          </p>
          <p>
            <strong>Cantidad:</strong> {order.quantity}
          </p>
          <p>
            <strong>Estado:</strong> {order.status}
          </p>
        </div>

        <div className="mt-3 flex justify-center">
          <QRCodeSVG value={String(order.id)} size={120} includeMargin />
        </div>

        <p className="mt-3 border-t border-dashed border-slate-400 pt-2 text-center text-[10px]">
          Presenta este QR al retirar el pedido.
        </p>
      </article>

      <button
        type="button"
        onClick={printTicket}
        className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Imprimir ticket
      </button>
    </section>
  );
}
