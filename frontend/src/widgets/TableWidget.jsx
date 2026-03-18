import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';

const TableWidget = ({ title, config }) => {
  const dateRange = config?.dateRange || 'all';
  const pageSize = config?.pagination || 10;
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['ordersTable', dateRange, page, pageSize, config?.columns, config?.sort, config?.filters],
    queryFn: () => analyticsApi.getOrdersTable({
      range: dateRange,
      page: page,
      page_size: pageSize,
      sort_field: config?.sort?.field || null,
      sort_order: config?.sort?.order || 'asc',
    }).then(res => res.data),
    staleTime: 30000,
  });

  const formatCurrency = (value) => {
    return '$' + (Number(value) || 0).toFixed(2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
      'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Completed': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const fontSize = config?.style?.fontSize || 14;
  const headerBgColor = config?.style?.headerColor || '#54bd95';

  // Default columns if none configured
  const displayColumns = config?.columns?.length > 0 
    ? config.columns 
    : ['product', 'quantity', 'total_amount', 'status'];

  // Column labels mapping — matches both frontend config names and backend field names
  const columnLabels = {
    customer_id: 'ID',
    customer_name: 'Customer',
    email_id: 'Email',
    phone_number: 'Phone',
    address: 'Address',
    order_id: 'Order ID',
    order_date: 'Date',
    product: 'Product',
    created_by: 'Created By',
    status: 'Status',
    total_amount: 'Total',
    unit_price: 'Price',
    quantity: 'Qty',
    // Legacy / direct field names
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
    country: 'Country',
  };

  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    if (column === 'total_amount' || column === 'unit_price') {
      return formatCurrency(value);
    }
    if (column === 'order_date' || column === 'created_at') {
      return formatDate(value);
    }
    return String(value) || '-';
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-1 overflow-hidden">
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
        <div className="w-full space-y-2 px-2">
          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-50 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-50 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-50 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-1 overflow-hidden">
        <div className="text-red-500 text-xs">Failed to load data</div>
      </div>
    );
  }

  const orders = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

  // Determine header text color based on background brightness
  const headerTextColor = (() => {
    const hex = headerBgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#374151' : '#ffffff';
  })();

  return (
    <div className="h-full w-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        <table 
          className="min-w-full divide-y divide-gray-200"
          style={{ fontSize: `${fontSize}px` }}
        >
          <thead style={{ backgroundColor: headerBgColor }}>
            <tr>
              {displayColumns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: headerTextColor }}
                >
                  {columnLabels[col] || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                {displayColumns.map((col) => (
                  <td 
                    key={col} 
                    className="px-2 py-1.5 whitespace-nowrap text-gray-700"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {col === 'status' ? (
                      <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(order[col])}`}>
                        {order[col]}
                      </span>
                    ) : (
                      formatCellValue(order[col], col)
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={displayColumns.length} className="px-2 py-4 text-center text-xs text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-2 py-1.5 shrink-0 bg-gray-50">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-2 py-0.5 text-xs border border-gray-200 rounded-md disabled:opacity-40 hover:bg-white transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-500 font-medium">
            {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-2 py-0.5 text-xs border border-gray-200 rounded-md disabled:opacity-40 hover:bg-white transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default TableWidget;
