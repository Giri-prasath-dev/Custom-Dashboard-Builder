import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';

const KPIWidget = ({ title, config }) => {
  const metric = config?.metric || 'total_amount';
  const aggregation = config?.aggregation || 'SUM';
  const dateRange = config?.dateRange || 'all';
  const format = config?.format || 'number';
  const precision = config?.precision ?? 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ['kpiData', metric, aggregation, dateRange],
    queryFn: () => analyticsApi.getKpi({
      metric: metric,
      aggregation: aggregation,
      range: dateRange
    }).then(res => res.data),
    staleTime: 30000,
  });

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    const numVal = Number(value);
    
    // Apply precision
    const formatted = numVal.toFixed(precision);
    
    // Apply format
    if (format === 'currency') {
      // Format with $ prefix and commas
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `$${parts.join('.')}`;
    }
    
    // Number format with abbreviation for large values
    if (numVal >= 1000000) {
      return `${(numVal / 1000000).toFixed(Math.max(1, precision))}M`;
    }
    if (numVal >= 10000) {
      return `${(numVal / 1000).toFixed(Math.max(1, precision))}k`;
    }
    
    // Comma-separated number
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const getDisplayValue = () => {
    if (!data || data.value === undefined) {
      return 'N/A';
    }
    return formatValue(data.value);
  };

  // Map metric names to readable labels
  const metricLabels = {
    total_amount: 'Total Amount',
    quantity: 'Quantity',
    unit_price: 'Unit Price',
    orders: 'Orders',
    customer_id: 'Customers',
    customer_name: 'Customers',
    email_id: 'Emails',
    product: 'Products',
    status: 'Statuses',
    created_by: 'Created By',
    order_date: 'Order Dates',
  };

  // Get aggregation label
  const getAggregationLabel = () => {
    if (aggregation === 'DISTINCT_COUNT') return 'Unique';
    return aggregation;
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-1 overflow-hidden">
        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
        <div className="w-8 h-2 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-1 overflow-hidden">
        <div className="text-red-500 text-xs">Failed</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-1">
      <div className="text-sm md:text-base lg:text-lg font-bold text-gray-900 truncate w-full text-center">
        {getDisplayValue()}
      </div>
      <div className="text-[10px] md:text-xs text-gray-400 truncate mt-0.5 w-full text-center">
        {metricLabels[metric] || metric} · {getAggregationLabel()}
      </div>
    </div>
  );
};

export default KPIWidget;
