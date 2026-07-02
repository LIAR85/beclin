import { useEffect, useMemo, useState } from 'react';
import { createOrderWithClient } from '../services/orders';

const QUEUE_KEY = 'be-clean-offline-orders';

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState(readQueue);
  const queueCount = useMemo(() => queue.length, [queue]);

  const enqueue = (payload) => {
    const item = {
      localId: `offline-${Date.now()}`,
      payload,
      createdAt: new Date().toISOString(),
    };

    const nextQueue = [...readQueue(), item];
    saveQueue(nextQueue);
    setQueue(nextQueue);
    return item;
  };

  const flushQueue = async () => {
    const pending = readQueue();
    if (!pending.length || !navigator.onLine) return;

    const failed = [];

    for (const item of pending) {
      try {
        await createOrderWithClient(item.payload);
      } catch {
        failed.push(item);
      }
    }

    saveQueue(failed);
    setQueue(failed);
  };

  useEffect(() => {
    const onOnline = () => {
      flushQueue();
    };

    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return { enqueue, flushQueue, queueCount };
}
