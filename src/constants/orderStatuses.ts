export const ORDER_STATUS = {
  PENDING: 'pending',
  COOKING: 'cooking',
  SERVED: 'served',
  PAID: 'paid',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['cooking'],
  cooking: ['served'],
  served: ['paid'],
  paid: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  cooking: 'Cooking',
  served: 'Served',
  paid: 'Paid',
};
