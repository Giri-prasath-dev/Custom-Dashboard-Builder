// Configuration Registry - Maps widget types to configuration panels
// This avoids switch statements and makes configuration extensible

import KPIConfigPanel from '../config-panels/KPIConfigPanel';
import ChartConfigPanel from '../config-panels/ChartConfigPanel';
import TableConfigPanel from '../config-panels/TableConfigPanel';

// Registry maps widget type -> configuration component
export const configRegistry = {
  // KPI widgets
  kpi: KPIConfigPanel,
  orders_summary: KPIConfigPanel,
  
  // Chart widgets
  bar_chart: ChartConfigPanel,
  line_chart: ChartConfigPanel,
  area_chart: ChartConfigPanel,
  scatter_chart: ChartConfigPanel,
  pie_chart: ChartConfigPanel,
  revenue_chart: ChartConfigPanel,
  chart: ChartConfigPanel,
  
  // Table widget
  table: TableConfigPanel,
};

// Get configuration component by widget type
export const getConfigPanel = (widgetType) => {
  return configRegistry[widgetType] || null;
};

// Check if widget type has configuration support
export const hasConfigPanel = (widgetType) => {
  return widgetType in configRegistry && configRegistry[widgetType] !== null;
};

// Default configuration for each widget type
export const defaultConfigs = {
  // KPI default config
  kpi: {
    title: 'KPI Widget',
    metric: 'total_amount',
    aggregation: 'SUM',
    format: 'number',
    precision: 0,
    description: '',
  },
  
  // Chart default configs
  bar_chart: {
    title: 'Bar Chart',
    xAxis: 'month',
    yAxis: 'total_amount',
    color: '#3b82f6',
    showLabels: false,
    label1: 'Series 1',
    label2: 'Series 2',
  },
  line_chart: {
    title: 'Line Chart',
    xAxis: 'month',
    yAxis: 'total_amount',
    color: '#3b82f6',
    showLabels: false,
    label1: 'Series 1',
    label2: 'Series 2',
  },
  area_chart: {
    title: 'Area Chart',
    xAxis: 'month',
    yAxis: 'total_amount',
    color: '#3b82f6',
    showLabels: false,
    label1: 'Series 1',
    label2: 'Series 2',
  },
  scatter_chart: {
    title: 'Scatter Plot',
    xAxis: 'quantity',
    yAxis: 'total_amount',
    color: '#3b82f6',
    xLabel: 'X Value',
    yLabel: 'Y Value',
    label1: 'Group 1',
    label2: 'Group 2',
  },
  pie_chart: {
    title: 'Pie Chart',
    color: '#3b82f6',
    showLegend: true,
    showTooltip: true,
    showPercentLabel: true,
    innerRadius: 0,
    outerRadius: 80,
  },
  
  // Table default config - matches the spec structure
  table: {
    title: 'Untitled',
    type: 'table',
    description: '',
    width: 5,
    height: 5,
    columns: [],
    sort: { field: '', order: 'asc' },
    pagination: 5,
    filters: [],
    style: {
      fontSize: 14,
      headerColor: '#E6E8EB'
    }
  },
};

// Available data fields for configuration - Order Data fields
export const ORDER_DATA_FIELDS = [
  { value: 'customer_name', label: 'Customer Name' },
  { value: 'email_id', label: 'Email ID' },
  { value: 'address', label: 'Address' },
  { value: 'order_date', label: 'Order Date' },
  { value: 'product', label: 'Product' },
  { value: 'created_by', label: 'Created By' },
  { value: 'status', label: 'Status' },
  { value: 'total_amount', label: 'Total Amount' },
  { value: 'unit_price', label: 'Unit Price' },
  { value: 'quantity', label: 'Quantity' },
];

// Available data fields for configuration
export const dataFields = {
  // Order data fields for Table widget
  table: ORDER_DATA_FIELDS,
  
  // KPI metric fields (mapped to Order data)
  kpi: [
    { value: 'customer_name', label: 'Customer Name' },
    { value: 'email_id', label: 'Email ID' },
    { value: 'address', label: 'Address' },
    { value: 'order_date', label: 'Order Date' },
    { value: 'product', label: 'Product' },
    { value: 'created_by', label: 'Created By' },
    { value: 'status', label: 'Status' },
    { value: 'total_amount', label: 'Total Amount' },
    { value: 'unit_price', label: 'Unit Price' },
    { value: 'quantity', label: 'Quantity' },
  ],
  
  // Table-specific columns (legacy - for backwards compatibility)
  tableColumns: [
    { value: 'customer_name', label: 'Customer Name' },
    { value: 'email_id', label: 'Email ID' },
    { value: 'address', label: 'Address' },
    { value: 'order_date', label: 'Order Date' },
    { value: 'product', label: 'Product' },
    { value: 'created_by', label: 'Created By' },
    { value: 'status', label: 'Status' },
    { value: 'total_amount', label: 'Total Amount' },
    { value: 'unit_price', label: 'Unit Price' },
    { value: 'quantity', label: 'Quantity' },
  ],
  
  // Numeric fields (for KPIs and Y-axis)
  numeric: [
    { value: 'total_amount', label: 'Total Amount' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'orders_count', label: 'Orders Count' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'avg_order_value', label: 'Avg Order Value' },
  ],
  
  // Categorical fields (for X-axis and table columns)
  categorical: [
    { value: 'month', label: 'Month' },
    { value: 'date', label: 'Date' },
    { value: 'product', label: 'Product' },
    { value: 'customer', label: 'Customer' },
    { value: 'status', label: 'Status' },
    { value: 'category', label: 'Category' },
  ],
};

// Filter attributes for Table widget
export const filterAttributes = [
  { value: 'product', label: 'Product' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'status', label: 'Status' },
];

// Filter operators
export const filterOperators = [
  { value: 'equals', label: 'Equals' },
  { value: 'lt', label: '<' },
  { value: 'contains', label: 'Contains' },
];

// Aggregation options for KPIs
export const aggregationOptions = [
  { value: 'SUM', label: 'Sum' },
  { value: 'AVG', label: 'Average' },
  { value: 'COUNT', label: 'Count' },
  { value: 'DISTINCT_COUNT', label: 'Unique Count' },
];

// Format options for KPIs
export const formatOptions = [
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
];

// Chart color options
export const chartColorOptions = [
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#10b981', label: 'Green', className: 'bg-green-500' },
  { value: '#8b5cf6', label: 'Purple', className: 'bg-purple-500' },
  { value: '#f59e0b', label: 'Orange', className: 'bg-orange-500' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  { value: '#ec4899', label: 'Pink', className: 'bg-pink-500' },
  { value: '#06b6d4', label: 'Cyan', className: 'bg-cyan-500' },
  { value: '#84cc16', label: 'Lime', className: 'bg-lime-500' },
];

// Table header background colors
export const headerColorOptions = [
  { value: '#E6E8EB', label: 'Gray', className: '' },
  { value: '#3B82F6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#10B981', label: 'Green', className: 'bg-green-500' },
  { value: '#8B5CF6', label: 'Purple', className: 'bg-purple-500' },
  { value: '#F59E0B', label: 'Orange', className: 'bg-orange-500' },
  { value: '#EF4444', label: 'Red', className: 'bg-red-500' },
];

// Font size options for tables
export const fontSizeOptions = [
  { value: 12, label: '12px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' },
];

// Pagination options for tables
export const paginationOptions = [
  { value: 5, label: '5 rows per page' },
  { value: 10, label: '10 rows per page' },
  { value: 15, label: '15 rows per page' },
];
