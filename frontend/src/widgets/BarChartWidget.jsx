import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { analyticsApi } from '../services/api';
import { getAxisLabel } from '../utils/axisLabels';

const BarChartWidget = ({ title, config }) => {
  const dateRange = config?.dateRange || 'all';
  const xField = config?.xAxis || config?.x || 'product';
  const yField = config?.yAxis || config?.y || 'quantity';
  const aggregation = config?.aggregation || 'SUM';
  const chartColor = config?.color || '#3b82f6';
  const showLabels = config?.showLabels || false;

  const { data, isLoading, error } = useQuery({
    queryKey: ['barChartData', xField, yField, aggregation, dateRange],
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
    chartData = data.map(function(item) {
      return {
        name: item.name || 'Unknown',
        value: item.value || 0,
      };
    });
  }

  return (
    <div className="h-full w-full min-h-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 45, bottom: 30 }}>
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
            label={{ value: getAxisLabel(yField), angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: 10, fill: '#374151', fontWeight: 500 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '11px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
          <Bar dataKey="value" fill={chartColor} radius={[3, 3, 0, 0]}>
            {showLabels && (
              <LabelList dataKey="value" position="top" style={{ fontSize: 9, fill: '#374151' }} offset={5} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartWidget;
