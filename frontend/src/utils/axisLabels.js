/**
 * Shared axis label mapping utility.
 * Converts raw backend field names to human-readable labels for chart axes.
 */
export const AXIS_LABEL_MAP = {
  product: 'Product',
  quantity: 'Quantity',
  unit_price: 'Unit Price',
  total_amount: 'Total Amount',
  status: 'Status',
  created_by: 'Created By',
  customer_name: 'Customer Name',
  customer_id: 'Customer ID',
  email_id: 'Email',
  order_date: 'Order Date',
  phone_number: 'Phone',
  address: 'Address',
  order_id: 'Order ID',
  revenue: 'Revenue',
  orders_count: 'Orders Count',
  avg_order_value: 'Avg Order Value',
  month: 'Month',
  date: 'Date',
  category: 'Category',
  city: 'City',
  country: 'Country',
};

/**
 * Returns a human-readable label for a given field name.
 * Falls back to title-casing the raw field name if not found.
 */
export const getAxisLabel = (field) => {
  if (!field) return '';
  if (AXIS_LABEL_MAP[field]) return AXIS_LABEL_MAP[field];
  // Fallback: convert snake_case to Title Case
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
