import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import OfflineBanner from './components/OfflineBanner';
import { isSupabaseConfigured } from './services/supabase';

const TABS = {
  dashboard: 'dashboard',
  scanner: 'scanner',
};

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.dashboard);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6 sm:max-w-2xl">
      <OfflineBanner />

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <strong>Supabase no configurado.</strong> Agrega{' '}
          <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> y{' '}
          <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code> en las variables de entorno de Netlify y vuelve a desplegar.
        </div>
      )}

      <motion.main
        key={activeTab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="flex-1"
      >
        {activeTab === TABS.dashboard ? <DashboardPage /> : <ScannerPage />}
      </motion.main>

      <nav className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-brand-100 bg-white/95 p-2 shadow-soft backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab(TABS.dashboard)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              activeTab === TABS.dashboard
                ? 'bg-brand-700 text-white'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            Recepcion
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TABS.scanner)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              activeTab === TABS.scanner
                ? 'bg-brand-700 text-white'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            Escaner QR
          </button>
        </div>
      </nav>
    </div>
  );
}
