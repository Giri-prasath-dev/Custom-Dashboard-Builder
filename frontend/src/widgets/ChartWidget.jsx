import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../services/api';
import { getAxisLabel } from '../utils/axisLabels';

const ChartWidget = ({ title, config }) => {
  const metric = config?.metric || 'revenue';
  const dateRange = config?.dateRange || 'all';
  const xField = config?.xAxis || config?.x || 'product';
  const yField = config?.yAxis || config?.y || 'quantity';
  const aggregation = config?.aggregation || 'SUM';
  const chartColor = config?.color || '#3b82f6';

  const { data, isLoading, error } = useQuery({
    queryKey: ['chartData', xField, yField, aggregation, dateRange],
    queryFn: () => analyticsApi.getChartData({
      x: xField,
      y: yField,
      aggregation: aggregation,
      range: dateRange
    }).then(res => res.data),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-1 overflow-hidden">
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
        <div className="w-3/4 h-2 bg-gray-100 rounded animate-pulse"></div>
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

  let chartData = [];
  if (Array.isArray(data)) {
    chartData = data.map((item) => ({
      name: item.name || item.product || item.label || 'Unknown',
      value: item.value || 0,
    }));
  } else if (data?.labels) {
    chartData = data.labels.map((label, index) => ({
      label,
      value: data?.values?.[index] || 0,
    }));
  }

  const formatValue = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  return (
    <div className="h-full w-full min-h-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 10, left: 45, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={false}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: getAxisLabel(xField), position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: '#374151', fontWeight: 500 } }}
          />
          <YAxis 
            tick={{ fontSize: 9, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            width={40}
            tickFormatter={formatValue}
            label={{ value: getAxisLabel(yField), angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: 10, fill: '#374151', fontWeight: 500 } }}
          />
          <Tooltip 
            formatter={(value, name) => [formatValue(value), name === 'value' ? getAxisLabel(yField) : name]}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '11px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={chartColor} 
            strokeWidth={2}
            dot={{ fill: chartColor, r: 3 }}
            activeDot={{ r: 5, fill: chartColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartWidget;
