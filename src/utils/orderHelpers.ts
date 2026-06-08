interface DiningInfo {
  dining_option: 'dine_in' | 'takeout';
  table_number: string | null;
}

export function formatDiningLabel({ dining_option, table_number }: DiningInfo): string {
  if (dining_option === 'takeout') return 'Takeout';
  return table_number ? `Table ${table_number}` : 'Dine In';
}
