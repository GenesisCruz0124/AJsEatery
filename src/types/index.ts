export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image_uri: string | null;
  is_available: number;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  table_number: string | null;
  customer_name: string | null;
  dining_option: 'dine_in' | 'takeout';
  status: 'pending' | 'cooking' | 'served' | 'paid';
  total_amount: number;
  cash_tendered: number | null;
  change_due: number | null;
  payment_type: 'cash' | 'gcash' | null;
  payment_proof_uri: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface KitchenOrder {
  id: number;
  order_number: string;
  table_number: string | null;
  customer_name: string | null;
  dining_option: 'dine_in' | 'takeout';
  status: string;
  total_amount: number;
  created_at: string;
  items_summary: string;
}

export interface CartEntry {
  menuItemId: number;
  name: string;
  unit_price: number;
  quantity: number;
  image_uri: string | null;
}

export interface SalesSummary {
  order_count: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface TopItem {
  name: string;
  units_sold: number;
  total_revenue: number;
}
