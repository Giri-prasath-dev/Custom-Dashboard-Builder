import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsApi } from '../services/api';
import { getAxisLabel } from '../utils/axisLabels';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const PieChartWidget = ({ title, config }) => {
  const dateRange = config?.dateRange || 'all';
  const groupByField = config?.groupBy || config?.group_by || 'product';
  const aggregation = config?.aggregation || 'COUNT';

  const { data, isLoading, error } = useQuery({
    queryKey: ['pieChartData', groupByField, aggregation, dateRange],
    queryFn: () => analyticsApi.getChartData({
      x: groupByField,
      y: groupByField,
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
        name: item.name || 'Unknown',
        value: item.value || 0,
        fill: COLORS[index % COLORS.length],
      };
    });
  }

  const showLegend = config?.showLegend !== false;

  return (
    <div className="h-full w-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              label={false}
              labelLine={false}
            >
            {chartData.map(function(entry, index) {
              return <Cell key={'cell-' + index} fill={entry.fill} />;
            })}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '11px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: '9px', overflow: 'hidden' }} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export default PieChartWidget;
