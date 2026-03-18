import { useState } from 'react';
import { widgetRegistry, isWidgetSupported } from '../registry/widgetRegistry';
import ChartWidget from '../widgets/ChartWidget';
import TableWidget from '../widgets/TableWidget';
import KPIWidget from '../widgets/KPIWidget';
import BarChartWidget from '../widgets/BarChartWidget';
import LineChartWidget from '../widgets/LineChartWidget';
import AreaChartWidget from '../widgets/AreaChartWidget';
import ScatterChartWidget from '../widgets/ScatterChartWidget';
import PieChartWidget from '../widgets/PieChartWidget';

// Map widget types to their components
const widgetComponents = {
  bar_chart: BarChartWidget,
  line_chart: LineChartWidget,
  area_chart: AreaChartWidget,
  scatter_chart: ScatterChartWidget,
  pie_chart: PieChartWidget,
  table: TableWidget,
  kpi: KPIWidget,
  chart: ChartWidget,
};

const WidgetRenderer = ({ widget, onSettings, onDelete, onDeleteConfirm, dateRange, isConfigMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Resolve the correct component for a widget type
  const resolveChartComponent = (chartType) => {
    const chartMap = {
      bar: BarChartWidget,
      line: LineChartWidget,
      area: AreaChartWidget,
      scatter: ScatterChartWidget,
      pie: PieChartWidget,
    };
    return chartMap[chartType] || BarChartWidget;
  };

  const renderWidget = () => {
    const { type, title, config = {} } = widget;
    
    // Merge dateRange into config - use prop if available, otherwise use config
    const effectiveDateRange = dateRange || config.dateRange || 'all';
    const mergedConfig = { ...config, dateRange: effectiveDateRange };
    
    // For 'chart' type, resolve subtype from config.chartType
    if (type === 'chart' && config.chartType) {
      const ChartComponent = resolveChartComponent(config.chartType);
      return <ChartComponent title={title} config={mergedConfig} />;
    }
    
    // Check widgetComponents map first, then fall back to registry
    const WidgetComponent = widgetComponents[type] || widgetRegistry[type];
    
    if (WidgetComponent) {
      return <WidgetComponent title={title} config={mergedConfig} />;
    }
    
    // Handle legacy widget types
    if (type === 'orders_summary') {
      return <KPIWidget title={title} config={{ ...mergedConfig, metric: 'orders' }} />;
    }
    if (type === 'revenue_chart') {
      return <ChartWidget title={title} config={{ ...mergedConfig, metric: 'revenue' }} />;
    }
    
    // Unsupported widget fallback
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">?</div>
          <span className="text-gray-500">Unsupported Widget: {type}</span>
        </div>
      </div>
    );
  };

  const handleSettingsClick = () => {
    if (onSettings) {
      onSettings(widget);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteConfirm) {
      onDeleteConfirm(widget.id);
    } else if (onDelete) {
      onDelete(widget.id);
    }
  };

  return ( 
    <div 
      className="h-full w-full flex flex-col overflow-hidden bg-white rounded-xl shadow-widget border border-gray-100 transition-shadow hover:shadow-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Widget Header with Title */}
      {!isConfigMode && (
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-semibold text-gray-700 truncate">{widget.title}</h3>
            </div>
          </div>
          {/* Hover Actions Overlay */}
          {isHovered && (
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 p-1">
              <button
                onClick={handleSettingsClick}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900"
                title="Edit widget"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-1.5 hover:bg-red-50 rounded transition-colors text-gray-500 hover:text-red-600"
                title="Delete widget"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      {/* Config mode: no extra header — drag handle in ConfigureDashboard already shows the title */}
      
      {/* Widget Content */}
      <div className="flex-1 overflow-hidden min-h-0 p-3">
        {renderWidget()}
      </div>
    </div>
  );
};

export default WidgetRenderer;
