import { useState } from 'react';

const INITIAL_FORM = {
  fullName: '',
  phone: '',
  email: '',
  serviceType: 'Lavado',
  serviceMode: 'Regular',
  customService: '',
  quantity: 1,
  notes: '',
};

const SERVICES = [
  { label: 'Lavado', icon: '🧺' },
  { label: 'Lavado + Planchado', icon: '👕' },
  { label: 'Edredones', icon: '🛏️' },
  { label: 'Tintoreria', icon: '🧥' },
  { label: 'Planchado', icon: '🧼' },
  { label: 'Secado', icon: '🌬️' },
  { label: 'Otro', icon: '➕' },
];

export default function OrderForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const quantityOptions = Array.from({ length: 20 }, (_, index) => index + 1);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (form.serviceType === 'Otro' && !form.customService.trim()) {
      setFormError('Escribe el servicio cuando selecciones la opcion Otro.');
      return;
    }

    if (!form.notes.trim()) {
      setFormError('El campo Notas es obligatorio.');
      return;
    }

    const payload = {
      ...form,
      serviceType: form.serviceType === 'Otro' ? form.customService.trim() : form.serviceType,
      serviceMode: form.serviceMode,
      email: form.email.trim(),
      notes: form.notes.trim(),
    };

    setPendingPayload(payload);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingPayload) return;

    try {
      const shouldReset = await onSubmit(pendingPayload);
      if (shouldReset) {
        setForm(INITIAL_FORM);
      }
      setPendingPayload(null);
      setConfirmOpen(false);
    } catch (error) {
      setFormError(error.message || 'No se pudo registrar el pedido.');
      setConfirmOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className="flex justify-center border-b border-brand-100 pb-3">
        <img
          src="/brand/beclin-logo.svg"
          alt="Be Clin Expertos Lavando"
          className="h-auto w-full max-w-[240px] object-contain"
        />
      </div>

      <h2 className="text-lg font-semibold text-slate-900">Registro de pedido</h2>

      <label className="block text-sm font-medium text-slate-700">
        Cliente
        <input
          required
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
          placeholder="Nombre completo"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Telefono
        <input
          required
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
          placeholder="3001234567"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Correo (opcional)
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
          placeholder="cliente@email.com"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Servicio</p>
        <div className="grid grid-cols-2 gap-2">
          {SERVICES.map((service) => {
            const isActive = form.serviceType === service.label;

            return (
              <button
                key={service.label}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, serviceType: service.label }))}
                className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'border-brand-700 bg-brand-100 text-brand-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                }`}
              >
                <span className="mr-2 text-lg" aria-hidden="true">
                  {service.icon}
                </span>
                {service.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Tipo de servicio</p>
        <div className="grid grid-cols-2 gap-2">
          {['Regular', 'Express'].map((mode) => {
            const isActive = form.serviceMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, serviceMode: mode }))}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-brand-700 bg-brand-100 text-brand-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                }`}
              >
                {mode === 'Express' ? '⚡ Servicio Express' : '🕒 Servicio Regular'}
              </button>
            );
          })}
        </div>
      </div>

      {form.serviceType === 'Otro' && (
        <label className="block text-sm font-medium text-slate-700">
          Especifica el servicio
          <input
            required
            name="customService"
            value={form.customService}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
            placeholder="Ejemplo: Lavado de cobija"
          />
        </label>
      )}

      <div className="grid grid-cols-1 gap-3">
        <label className="block text-sm font-medium text-slate-700">
          Cantidad (Wheel Picker)
          <select
            required
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
          >
            {quantityOptions.map((option) => (
              <option key={option} value={option}>
                {option} prendas
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Notas
        <textarea
          required
          rows={2}
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
          placeholder="Manchas, instrucciones especiales..."
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Generando ticket...' : 'Generar ticket'}
      </button>

      {formError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{formError}</p>
      )}

      {confirmOpen && pendingPayload && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-slate-800">
          <p className="font-semibold text-brand-900">Confirmar registro de pedido</p>
          <p className="mt-1">
            Cliente: <strong>{pendingPayload.fullName}</strong>
          </p>
          <p>
            Servicio: <strong>{pendingPayload.serviceType}</strong>
          </p>
          <p>
            Tipo: <strong>{pendingPayload.serviceMode}</strong> | Cantidad: <strong>{pendingPayload.quantity}</strong>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setPendingPayload(null);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={loading}
              className="rounded-xl bg-brand-700 px-3 py-2 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
