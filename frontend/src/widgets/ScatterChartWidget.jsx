import { useQuery } from '@tanstack/react-query';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../services/api';
import { getAxisLabel } from '../utils/axisLabels';

const ScatterChartWidget = ({ title, config }) => {
  const dateRange = config?.dateRange || 'all';
  const xField = config?.xAxis || config?.x || 'product';
  const yField = config?.yAxis || config?.y || 'quantity';
  const aggregation = config?.aggregation || 'SUM';
  const chartColor = config?.color || '#3b82f6';

  const { data, isLoading, error } = useQuery({
    queryKey: ['scatterChartData', xField, yField, aggregation, dateRange],
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
    chartData = data.map(function(item, index) {
      return {
        x: index + 1,
        y: item.value || 0,
        name: item.name || 'Unknown',
      };
    });
  }

  return (
    <div className="h-full w-full min-h-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 10, left: 45, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            dataKey="x" 
            name={getAxisLabel(xField)}
            tick={false}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: getAxisLabel(xField), position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: '#374151', fontWeight: 500 } }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            name={getAxisLabel(yField)}
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
            formatter={function(value, name) {
              if (name === 'y') {
                return [value, getAxisLabel(yField)];
              } else if (name === 'x') {
                return [value, getAxisLabel(xField)];
              }
              return [value, name];
            }}
            labelFormatter={function(label, payload) {
              return payload?.[0]?.payload?.name || '';
            }}
          />
          <Scatter data={chartData} fill={chartColor} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartWidget;
