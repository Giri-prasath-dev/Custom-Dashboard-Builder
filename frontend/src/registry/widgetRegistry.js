// Widget Registry - Central registry mapping widget types to components
// This prevents large switch statements and makes widgets extensible

import BarChartWidget from '../widgets/BarChartWidget';
import LineChartWidget from '../widgets/LineChartWidget';
import AreaChartWidget from '../widgets/AreaChartWidget';
import ScatterChartWidget from '../widgets/ScatterChartWidget';
import PieChartWidget from '../widgets/PieChartWidget';
import TableWidget from '../widgets/TableWidget';
import KPIWidget from '../widgets/KPIWidget';

// Registry maps widget type string -> component
export const widgetRegistry = {
  // Chart widgets
  bar_chart: BarChartWidget,
  line_chart: LineChartWidget,
  area_chart: AreaChartWidget,
  scatter_chart: ScatterChartWidget,
  pie_chart: PieChartWidget,
  
  // Data widgets
  table: TableWidget,
  
  // KPI widgets
  kpi: KPIWidget,
  
  // Legacy widget types (for backward compatibility)
  chart: null, // Will be mapped to default chart
  orders_summary: null, // Legacy - handled specially
  revenue_chart: null, // Legacy - handled specially
};

// Widget metadata for the library panel
export const widgetLibrary = [
  {
    type: 'bar_chart',
    label: 'Bar Chart',
    description: 'Display data as vertical bars',
    defaultWidth: 4,
    defaultHeight: 3,
    icon: '📊',
  },
  {
    type: 'line_chart',
    label: 'Line Chart',
    description: 'Display trends over time',
    defaultWidth: 4,
    defaultHeight: 3,
    icon: '📈',
  },
  {
    type: 'area_chart',
    label: 'Area Chart',
    description: 'Display filled area chart',
    defaultWidth: 4,
    defaultHeight: 3,
    icon: '📉',
  },
  {
    type: 'scatter_chart',
    label: 'Scatter Plot',
    description: 'Display data points on coordinate system',
    defaultWidth: 4,
    defaultHeight: 3,
    icon: '🔹',
  },
  {
    type: 'pie_chart',
    label: 'Pie Chart',
    description: 'Display data as pie slices',
    defaultWidth: 4,
    defaultHeight: 4,
    icon: '🥧',
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Display data in tabular format',
    defaultWidth: 6,
    defaultHeight: 4,
    icon: '📋',
  },
  {
    type: 'kpi',
    label: 'KPI Card',
    description: 'Display key metrics',
    defaultWidth: 2,
    defaultHeight: 2,
    icon: '🎯',
  },
];

// Get widget component by type
export const getWidgetComponent = (type) => {
  return widgetRegistry[type] || null;
};

// Check if widget type is supported
export const isWidgetSupported = (type) => {
  return type in widgetRegistry && widgetRegistry[type] !== null;
};

// Get default dimensions for widget type
export const getDefaultDimensions = (type) => {
  const widget = widgetLibrary.find(w => w.type === type);
  if (widget) {
    return { w: widget.defaultWidth, h: widget.defaultHeight };
  }
  return { w: 4, h: 3 }; // Default dimensions
};
