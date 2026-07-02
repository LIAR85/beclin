import { useMutation } from '@tanstack/react-query';
import { markOrderCompleted } from '../services/orders';

export function useMarkOrderCompleted() {
  return useMutation({
    mutationFn: markOrderCompleted,
  });
}
