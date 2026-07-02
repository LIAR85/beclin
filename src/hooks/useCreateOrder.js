import { useMutation } from '@tanstack/react-query';
import { createOrderWithClient } from '../services/orders';

export function useCreateOrder() {
  return useMutation({
    mutationFn: createOrderWithClient,
  });
}
