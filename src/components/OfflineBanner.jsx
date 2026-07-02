import { useConnectivity } from '../hooks/useConnectivity';

export default function OfflineBanner() {
  const { isOnline } = useConnectivity();

  if (isOnline) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
      Offline mode: new orders are queued locally and synced when internet returns.
    </div>
  );
}
