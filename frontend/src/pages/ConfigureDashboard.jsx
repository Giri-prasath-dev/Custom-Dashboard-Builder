import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { debounce } from 'lodash';
import WidgetRenderer from '../components/WidgetRenderer';
import TableConfigPanel from '../config-panels/TableConfigPanel';
import KPIConfigPanel from '../config-panels/KPIConfigPanel';
import PieChartConfigPanel from '../config-panels/PieChartConfigPanel';
import ChartConfigPanel from '../config-panels/ChartConfigPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

// Widget categories per specification
const WIDGET_CATEGORIES = [
  {
    name: 'Charts',
    widgets: [
      { type: 'chart', label: 'Bar Chart', icon: 'bar', defaultConfig: { chartType: 'bar' } },
      { type: 'chart', label: 'Line Chart', icon: 'line', defaultConfig: { chartType: 'line' } },
      { type: 'chart', label: 'Pie Chart', icon: 'pie', defaultConfig: { chartType: 'pie' } },
      { type: 'chart', label: 'Area Chart', icon: 'area', defaultConfig: { chartType: 'area' } },
      { type: 'chart', label: 'Scatter Plot', icon: 'scatter', defaultConfig: { chartType: 'scatter' } },
    ]
  },
  {
    name: 'Tables',
    widgets: [
      { type: 'table', label: 'Table', icon: 'table', defaultConfig: {} },
    ]
  },
  {
    name: 'KPIs',
    widgets: [
      { type: 'kpi', label: 'KPI Value', icon: 'kpi', defaultConfig: {} },
    ]
  },
];

// Date filters
const DATE_FILTERS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
];

// Widget type icons (SVG)
const WidgetIcon = ({ type, className = "w-4 h-4" }) => {
  const icons = {
    bar: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    line: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    pie: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    area: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    scatter: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="7" cy="14" r="2" /><circle cx="11" cy="8" r="2" /><circle cx="16" cy="16" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="14" cy="12" r="2" />
      </svg>
    ),
    table: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    kpi: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };
  return icons[type] || icons.bar;
};

// Category header icons
const CategoryIcon = ({ name, className = "w-4 h-4" }) => {
  if (name === 'Charts') return <WidgetIcon type="bar" className={className} />;
  if (name === 'Tables') return <WidgetIcon type="table" className={className} />;
  if (name === 'KPIs') return <WidgetIcon type="kpi" className={className} />;
  return null;
};

const ConfigureDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const [toast, setToast] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [defaultDashboardId, setDefaultDashboardId] = useState(null);
  const [layout, setLayout] = useState([]);
  const containerRef = useRef(null);
  const { width } = useContainerWidth(containerRef);
  
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({
    Charts: true,
    Tables: false,
    KPIs: false,
  });
  
  // Config panel states
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [editingWidget, setEditingWidget] = useState(null);
  const [showTableConfigModal, setShowTableConfigModal] = useState(false);
  const [tableConfig, setTableConfig] = useState(null);
  const [showKpiConfigModal, setShowKpiConfigModal] = useState(false);
  const [kpiConfig, setKpiConfig] = useState(null);
  const [showPieChartConfigModal, setShowPieChartConfigModal] = useState(false);
  const [pieChartConfig, setPieChartConfig] = useState(null);
  const [showChartConfigModal, setShowChartConfigModal] = useState(false);
  const [chartConfig, setChartConfig] = useState(null);
  
  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, widgetId: null });
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Widget form for generic config
  const [widgetForm, setWidgetForm] = useState({
    title: '', type: '', description: '',
    width: 4, height: 3,
    metric: 'revenue', aggregation: 'sum',
    dataFormat: 'number', decimalPrecision: 2,
  });

  // Drag state for visual feedback
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  };

  const toggleCategory = (name) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => { initializeDashboard(); }, []);

  const initializeDashboard = async () => {
    try {
      const response = await dashboardApi.getDashboards();
      const dashboards = response.data.results || response.data;
      if (dashboards.length > 0) {
        setDefaultDashboardId(dashboards[0].id);
        fetchWidgets(dashboards[0].id);
      } else {
        const createResponse = await dashboardApi.createDashboard({
          name: 'My Dashboard', description: 'Default dashboard',
        });
        setDefaultDashboardId(createResponse.data.id);
      }
    } catch (err) {
      console.error('Error initializing dashboard:', err);
    }
  };

  const fetchWidgets = async (dashboardId) => {
    try {
      const response = await dashboardApi.getWidgets(dashboardId);
      setWidgets(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching widgets:', err);
    }
  };

  // Convert widgets to layout
  useEffect(() => {
    if (widgets?.length > 0) {
      const newLayout = widgets.map((widget) => {
        // FIX OVERFLOW: Clamp width to max 12 columns
        const MAX_COLS = 12;
        const MAX_ROWS = 20;
        
        const w = Math.min(widget.width || 4, MAX_COLS);
        const h = Math.min(widget.height || 3, MAX_ROWS);
        // Clamp x so x + w doesn't exceed 12
        const x = Math.min(widget.position_x || 0, MAX_COLS - w);
        const y = Math.max(widget.position_y || 0, 0);
        return {
          i: String(widget.id),
          x,
          y,
          w,
          h,
          minW: 2, minH: 2,
          maxW: MAX_COLS,
        };
      });
      setLayout(newLayout);
    } else {
      setLayout([]);
    }
  }, [widgets]);

  // Debounced layout save
  const saveLayout = useCallback(
    debounce(async (newLayout) => {
      if (!defaultDashboardId) return;
      setSavingLayout(true);
      try {
        const updatePromises = newLayout.map((item) => {
          return dashboardApi.updateWidget(item.i, {
            position_x: item.x, position_y: item.y,
            width: item.w, height: item.h,
          });
        });
        await Promise.all(updatePromises);
        const response = await dashboardApi.getWidgets(defaultDashboardId);
        setWidgets(response.data.results || response.data);
      } catch (err) {
        console.error('Error saving layout:', err);
      } finally {
        setSavingLayout(false);
      }
    }, 500),
    [defaultDashboardId]
  );

  const handleLayoutChange = (newLayout) => {
    // FIX OVERFLOW: Ensure no widget exceeds grid bounds
    const MAX_COLS = 12;
    const MAX_ROWS = 20;
    
    const constrainedLayout = newLayout.map(item => {
      let { x, y, w, h } = item;
      
      // Constrain width
      if (w > MAX_COLS) w = MAX_COLS;
      if (w < 2) w = 2;
      
      // Constrain height
      if (h > MAX_ROWS) h = MAX_ROWS;
      if (h < 2) h = 2;
      
      // Constrain x position (widget shouldn't exceed grid width)
      if (x + w > MAX_COLS) {
        x = Math.max(0, MAX_COLS - w);
      }
      if (x < 0) x = 0;
      
      // Constrain y position
      if (y < 0) y = 0;
      
      return { ...item, x, y, w, h };
    });
    
    setLayout(constrainedLayout);
    saveLayout(constrainedLayout);
  };

  // Manual save with confirmation
  const handleSaveClick = () => setConfirmSave(true);
  const handleConfirmSave = () => {
    setConfirmSave(false);
    saveLayout(layout);
    showToast('All set! Your changes have been saved successfully');
  };

  const handleCancel = () => setConfirmCancel(true);
  const handleConfirmCancel = () => {
    setConfirmCancel(false);
    navigate('/dashboard/view');
  };

  const getWidgetById = (id) => widgets.find((w) => String(w.id) === String(id));

  // Format widget type for display
  const formatWidgetType = (widget) => {
    if (widget.type === 'chart') {
      const chartType = widget.config?.chartType;
      if (chartType === 'bar') return 'Bar Chart';
      if (chartType === 'line') return 'Line Chart';
      if (chartType === 'pie') return 'Pie Chart';
      if (chartType === 'area') return 'Area Chart';
      if (chartType === 'scatter') return 'Scatter Plot';
      return 'Chart';
    }
    if (widget.type === 'kpi') return 'KPI';
    if (widget.type === 'table') return 'Table';
    return widget.type;
  };

  // Handle drag start from sidebar - attach metadata for drop positioning
  const handleDragStart = (e, widget) => {
    const dragData = {
      type: widget.type,
      label: widget.label,
      defaultConfig: widget.defaultConfig || {},
      // Default dimensions for the widget
      w: widget.defaultConfig?.width || getDefaultWidgetWidth(widget.type),
      h: widget.defaultConfig?.height || getDefaultWidgetHeight(widget.type),
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Helper functions to get default widget dimensions
  const getDefaultWidgetWidth = (type) => {
    if (type === 'chart') return 4;
    if (type === 'table') return 6;
    if (type === 'kpi') return 2;
    return 4;
  };

  const getDefaultWidgetHeight = (type) => {
    if (type === 'chart') return 3;
    if (type === 'table') return 4;
    if (type === 'kpi') return 2;
    return 3;
  };

// Handle drop onto grid - create widget at mouse-calculated position and open config
  const handleDrop = async (event) => {
    try {
      event.preventDefault();
      const widgetData = JSON.parse(event.dataTransfer.getData('text/plain'));
      
      // Get grid rect for position calculation
      const gridRect = containerRef.current?.getBoundingClientRect();
      if (!gridRect) return;

      // Calculate grid position from mouse coordinates
      const colWidth = gridRect.width / 12; // 12 columns
      const rowHeight = 80; // Consistent with RGL rowHeight
      const gridX = Math.floor((event.clientX - gridRect.left) / colWidth);
      const gridY = Math.floor((event.clientY - gridRect.top) / rowHeight);

      // Dimensions from metadata
      const dropW = widgetData.w || getDefaultWidgetWidth(widgetData.type);
      const dropH = widgetData.h || getDefaultWidgetHeight(widgetData.type);

      // Clamp to grid bounds (consistent with DashboardGrid.jsx)
      const MAX_COLS = 12;
      const MAX_ROWS = 20;
      const constrainedX = Math.max(0, Math.min(gridX, MAX_COLS - dropW));
      const constrainedY = Math.max(0, gridY);
      const constrainedW = Math.min(dropW, MAX_COLS - constrainedX);
      const constrainedH = Math.min(dropH, MAX_ROWS - constrainedY);

      // Create widget at calculated position
      const createResponse = await dashboardApi.createWidget({
        dashboard: defaultDashboardId,
        type: widgetData.type,
        title: widgetData.label || 'Untitled Widget',
        description: '',
        config: widgetData.defaultConfig || {},
        position_x: constrainedX,
        position_y: constrainedY,
        width: constrainedW,
        height: constrainedH,
      });
      
      // Refresh widgets list
      await fetchWidgets(defaultDashboardId);
      
      // Auto-open config for new widget (small delay for state update)
      const newWidget = createResponse.data;
      setTimeout(() => handleEditWidget(newWidget), 200);
      
      showToast(`Added ${widgetData.label} at grid position (${constrainedX}, ${constrainedY})`);
    } catch (err) {
      console.error('Error handling drop:', err);
      showToast('Failed to add widget', 'error');
    }
  };

  // Handle widget click from sidebar
  const handleWidgetClick = (widget) => {
    setSelectedWidget(widget);
    setEditingWidget(null);
    
    if (widget.type === 'kpi') {
      setKpiConfig({
        id: null, title: 'Untitled', type: 'kpi',
        description: '', width: 2, height: 2,
        metric: '', aggregation: 'COUNT',
        format: 'number', precision: 0,
        dateRange: dateFilter,
      });
      setShowKpiConfigModal(true);
      return;
    }
    
    if (widget.type === 'table') {
      setTableConfig({
        title: 'Untitled', type: 'table',
        description: '', width: 4, height: 4,
        columns: [], sort: { field: '', order: 'asc' },
        pagination: 5, filters: [],
        style: { fontSize: 14, headerColor: '#54bd95' },
        dateRange: dateFilter,
      });
      setShowTableConfigModal(true);
      return;
    }
    
    if (widget.type === 'chart' && widget.defaultConfig?.chartType === 'pie') {
      setPieChartConfig({
        id: null, title: 'Untitled', type: 'pie_chart',
        description: '', width: 4, height: 4,
        group_by: 'product', aggregation: 'count',
        showLegend: true, dateRange: dateFilter,
      });
      setShowPieChartConfigModal(true);
      return;
    }

    // Bar, Line, Area, Scatter charts
    if (widget.type === 'chart') {
      const chartTypeLabel = {
        bar: 'Bar Chart', line: 'Line Chart',
        area: 'Area Chart', scatter: 'Scatter Plot',
      }[widget.defaultConfig?.chartType] || 'Chart';
      
      setChartConfig({
        id: null, title: 'Untitled',
        type: widget.defaultConfig?.chartType || 'bar',
        chartTypeLabel,
        description: '', width: 5, height: 5,
        xAxis: 'product', yAxis: 'total_amount',
        color: '#54bd95', showLabels: false,
        dateRange: dateFilter,
      });
      setShowChartConfigModal(true);
      return;
    }
    
    setWidgetForm({
      title: widget.label, type: widget.type,
      description: '', width: 4, height: 3,
      metric: 'revenue', aggregation: 'sum',
      dataFormat: 'number', decimalPrecision: 2,
    });
    setShowWidgetModal(true);
  };

  // Handle editing existing widget
  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
    setSelectedWidget(null);
    
    if (widget.type === 'kpi') {
      setKpiConfig({
        id: widget.id, title: widget.title || 'Untitled',
        type: 'kpi', description: widget.description || '',
        width: widget.width || 2, height: widget.height || 2,
        metric: widget.config?.metric || '',
        aggregation: widget.config?.aggregation || 'COUNT',
        format: widget.config?.format || 'number',
        precision: widget.config?.precision ?? 0,
      });
      setShowKpiConfigModal(true);
      return;
    }
    
    if (widget.type === 'table') {
      setTableConfig({
        id: widget.id, title: widget.title || 'Untitled',
        type: 'table', description: widget.description || '',
        width: widget.width || 4, height: widget.height || 4,
        columns: widget.config?.columns || [],
        sort: widget.config?.sort || { field: '', order: 'asc' },
        pagination: widget.config?.pagination || 5,
        filters: widget.config?.filters || [],
        style: widget.config?.style || { fontSize: 14, headerColor: '#54bd95' },
      });
      setShowTableConfigModal(true);
      return;
    }
    
    if (widget.type === 'chart' && widget.config?.chartType === 'pie') {
      setPieChartConfig({
        id: widget.id, title: widget.title || 'Untitled',
        type: 'pie_chart', description: widget.description || '',
        width: widget.width || 4, height: widget.height || 4,
        group_by: widget.config?.groupBy || widget.config?.group_by || 'product',
        aggregation: widget.config?.aggregation || 'count',
        showLegend: widget.config?.showLegend !== undefined ? widget.config.showLegend : true,
      });
      setShowPieChartConfigModal(true);
      return;
    }

    if (widget.type === 'chart') {
      const chartType = widget.config?.chartType || 'bar';
      const chartTypeLabel = {
        bar: 'Bar Chart', line: 'Line Chart',
        area: 'Area Chart', scatter: 'Scatter Plot',
      }[chartType] || 'Chart';

      setChartConfig({
        id: widget.id, title: widget.title || 'Untitled',
        type: chartType, chartTypeLabel,
        description: widget.description || '',
        width: widget.width || 5, height: widget.height || 5,
        xAxis: widget.config?.xAxis || 'product',
        yAxis: widget.config?.yAxis || 'total_amount',
        color: widget.config?.color || '#54bd95',
        showLabels: widget.config?.showLabels || false,
      });
      setShowChartConfigModal(true);
      return;
    }
    
    setWidgetForm({
      title: widget.title || '', type: widget.type,
      description: widget.description || '',
      width: widget.width || 4, height: widget.height || 3,
      metric: widget.config?.metric || 'revenue',
      aggregation: widget.config?.aggregation || 'sum',
      dataFormat: widget.config?.dataFormat || 'number',
      decimalPrecision: widget.config?.decimalPrecision || 2,
    });
    setShowWidgetModal(true);
  };

  // Save handlers for each widget type
  const handleSaveTableWidget = async (configData) => {
    if (!defaultDashboardId) return;
    setLoading(true);
    try {
      const config = { columns: configData.columns, sort: configData.sort, pagination: configData.pagination, filters: configData.filters, style: configData.style };
      if (configData.id) {
        await dashboardApi.updateWidget(configData.id, { title: configData.title, description: configData.description || '', config, width: configData.width, height: configData.height });
        showToast('Widget updated successfully!');
      } else {
        await dashboardApi.createWidget({ dashboard: defaultDashboardId, type: 'table', title: configData.title, description: configData.description || '', config, position_x: 0, position_y: 0, width: configData.width, height: configData.height });
        showToast('Widget added successfully!');
      }
      setShowTableConfigModal(false);
      fetchWidgets(defaultDashboardId);
    } catch (err) {
      showToast('Error saving widget: ' + (err.response?.data?.detail || err.message), 'error');
    } finally { setLoading(false); }
  };

  const handleSaveKpiWidget = async (configData) => {
    if (!defaultDashboardId) return;
    setLoading(true);
    try {
      const config = { metric: configData.metric, aggregation: configData.aggregation, format: configData.format, precision: configData.precision };
      if (configData.id) {
        await dashboardApi.updateWidget(configData.id, { title: configData.title, description: configData.description || '', config, width: configData.width, height: configData.height });
        showToast('Widget updated successfully!');
      } else {
        await dashboardApi.createWidget({ dashboard: defaultDashboardId, type: 'kpi', title: configData.title, description: configData.description || '', config, position_x: 0, position_y: 0, width: configData.width, height: configData.height });
        showToast('Widget added successfully!');
      }
      setShowKpiConfigModal(false);
      fetchWidgets(defaultDashboardId);
    } catch (err) {
      showToast('Error saving widget: ' + (err.response?.data?.detail || err.message), 'error');
    } finally { setLoading(false); }
  };

  const handleSavePieChartWidget = async (configData) => {
    if (!defaultDashboardId) return;
    setLoading(true);
    try {
      const config = { groupBy: configData.group_by, aggregation: configData.aggregation, showLegend: configData.showLegend, chartType: 'pie' };
      if (configData.id) {
        await dashboardApi.updateWidget(configData.id, { title: configData.title, description: configData.description || '', config, width: configData.width, height: configData.height });
        showToast('Widget updated successfully!');
      } else {
        await dashboardApi.createWidget({ dashboard: defaultDashboardId, type: 'chart', title: configData.title, description: configData.description || '', config, position_x: 0, position_y: 0, width: configData.width, height: configData.height });
        showToast('Widget added successfully!');
      }
      setShowPieChartConfigModal(false);
      fetchWidgets(defaultDashboardId);
    } catch (err) {
      showToast('Error saving widget: ' + (err.response?.data?.detail || err.message), 'error');
    } finally { setLoading(false); }
  };

  const handleSaveChartWidget = async (configData) => {
    if (!defaultDashboardId) return;
    setLoading(true);
    try {
      const config = { chartType: configData.type, xAxis: configData.xAxis, yAxis: configData.yAxis, color: configData.color, showLabels: configData.showLabels };
      if (configData.id) {
        await dashboardApi.updateWidget(configData.id, { title: configData.title, description: configData.description || '', config, width: configData.width, height: configData.height });
        showToast('Widget updated successfully!');
      } else {
        await dashboardApi.createWidget({ dashboard: defaultDashboardId, type: 'chart', title: configData.title, description: configData.description || '', config, position_x: 0, position_y: 0, width: configData.width, height: configData.height });
        showToast('Widget added successfully!');
      }
      setShowChartConfigModal(false);
      fetchWidgets(defaultDashboardId);
    } catch (err) {
      showToast('Error saving widget: ' + (err.response?.data?.detail || err.message), 'error');
    } finally { setLoading(false); }
  };

  const handleSaveWidget = async () => {
    if (!defaultDashboardId) return;
    setLoading(true);
    try {
      const config = { metric: widgetForm.metric, aggregation: widgetForm.aggregation, dataFormat: widgetForm.dataFormat, decimalPrecision: widgetForm.decimalPrecision, chartType: selectedWidget?.defaultConfig?.chartType || editingWidget?.config?.chartType || null };
      if (editingWidget) {
        await dashboardApi.updateWidget(editingWidget.id, { title: widgetForm.title, description: widgetForm.description, config, width: widgetForm.width, height: widgetForm.height });
        showToast('Widget updated successfully!');
      } else {
        await dashboardApi.createWidget({ dashboard: defaultDashboardId, type: widgetForm.type, title: widgetForm.title, description: widgetForm.description, config, position_x: 0, position_y: 0, width: widgetForm.width, height: widgetForm.height });
        showToast('Widget added successfully!');
      }
      setShowWidgetModal(false);
      fetchWidgets(defaultDashboardId);
    } catch (err) {
      showToast('Error saving widget: ' + (err.response?.data?.detail || err.message), 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteWidget = (widgetId) => {
    setConfirmDialog({ isOpen: true, widgetId });
  };

  const handleConfirmDelete = async () => {
    const widgetId = confirmDialog.widgetId;
    setConfirmDialog({ isOpen: false, widgetId: null });
    try {
      await dashboardApi.deleteWidget(widgetId);
      showToast('Widget deleted successfully!');
      fetchWidgets(defaultDashboardId);
    } catch (err) {
      showToast('Error deleting widget', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col max-w-7xl mx-auto w-full">
      {/* Toast */}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Confirm Dialogs */}
      <ConfirmDialog isOpen={confirmDialog.isOpen} title="Delete Widget" message="Are you sure you want to delete this widget?" confirmText="Delete" variant="danger" onConfirm={handleConfirmDelete} onCancel={() => setConfirmDialog({ isOpen: false, widgetId: null })} />
      <ConfirmDialog isOpen={confirmSave} title="Save Configuration" message="Save your current dashboard configuration?" confirmText="Save" variant="success" onConfirm={handleConfirmSave} onCancel={() => setConfirmSave(false)} />
      <ConfirmDialog isOpen={confirmCancel} title="Discard Changes?" message="Any unsaved changes will be lost. Are you sure?" confirmText="Discard" variant="danger" onConfirm={handleConfirmCancel} onCancel={() => setConfirmCancel(false)} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="w-full flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/view')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Configure dashboard</h1>
            <p className="text-xs text-gray-500">Configure your dashboard widgets and data sources</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left Sidebar - Widget Library - Fixed Width */}
            <div className="lg:w-72 flex-shrink-0 h-fit lg:sticky lg:top-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                {/* Date Filter */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Show data for</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95] text-sm bg-white"
                  >
                    {DATE_FILTERS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* Widget Library */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Widget library</h2>
                  <p className="text-xs text-gray-400 mb-4">Drag widgets to your dashboard</p>

                  {WIDGET_CATEGORIES.map((category) => (
                    <div key={category.name} className="mb-2">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#ecfdf5] border border-[#54bd95]/20 rounded-lg hover:bg-[#d1fae5] transition-colors text-sm"
                      >
                        <span className="font-medium text-[#047857] flex items-center gap-2">
                          <CategoryIcon name={category.name} className="w-4 h-4" />
                          {category.name}
                        </span>
                        <svg className={`w-4 h-4 text-[#54bd95] transition-transform duration-200 ${expandedCategories[category.name] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Category Children */}
                      <div className={`accordion-content ${expandedCategories[category.name] ? 'expanded' : 'collapsed'}`}>
                        <div className="mt-1.5 space-y-1 pl-2">
                          {category.widgets.map((widget, index) => (
                            <div
                              key={widget.label}
                              draggable={true}
                              unselectable="on"
                              onDragStart={(e) => handleDragStart(e, widget)}
                              onDragEnd={(e) => {
                                e.dataTransfer.clearData();
                              }}
                              onClick={() => handleWidgetClick(widget)}
                              className="draggable-widget flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-[#54bd95] hover:shadow-sm transition-all"
                            >
                              <span className="text-xs text-gray-400 font-medium w-4">{index + 1}</span>
                              <WidgetIcon type={widget.icon} className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{widget.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Canvas Grid - Full Width */}
            <div className="flex-1 min-w-0 overflow-auto h-[calc(100vh-180px)]">
              <div className="w-full">
                {widgets.length === 0 ? (
                  <div className="canvas-grid flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">No widgets configured</p>
                      <p className="text-xs text-gray-400">Click on a widget from the library to add it</p>
                    </div>
                  </div>
                ) : (
                  <div ref={containerRef}>
                    {savingLayout && (
                      <div className="fixed top-4 right-4 bg-[#54bd95] text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    )}
                    {width > 0 && (
                      <div 
                        className={`canvas-grid p-4 w-full transition-all duration-200 ${isDraggingOver ? 'bg-blue-50/50 ring-2 ring-blue-200 ring-inset shadow-lg border-dashed border-blue-300' : 'border-2 border-dashed border-gray-200'}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'copy';
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(true);
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget)) {
                            setIsDraggingOver(false);
                          }
                        }}
                        onDrop={handleDrop}
                      > 
                        <ResponsiveGridLayout
                          className="layout"
                          layouts={{ lg: layout }}
                          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                          cols={{ lg: 12, md: 8, sm: 4, xs: 4 }}
                          rowHeight={80}
                          width={width}
                          onLayoutChange={handleLayoutChange}
                          onDrop={handleDrop}
                          draggableHandle=".drag-handle"
                          isResizable={true}
                          isDraggable={true}
                          isDroppable={true}
                          isBounded={true}
                          margin={[16, 16]}
                          preventCollision={true}
                          compactType="vertical"
                          useCSSTransforms={true}
                          droppingItem={{ i: '__dropping-elem__', w: 4, h: 3 }}
                          onResizeStop={(layout, oldItem, newItem, placeholder, event, element) => {
                            // FIX OVERFLOW: Constrain widget to grid bounds after resize
                            const MAX_COLS = 12;
                            const MAX_ROWS = 20; // Maximum rows allowed
                            
                            let constrainedW = newItem.w;
                            let constrainedH = newItem.h;
                            let constrainedX = newItem.x;
                            
                            // Prevent width overflow
                            if (newItem.x + newItem.w > MAX_COLS) {
                              constrainedW = MAX_COLS - newItem.x;
                              constrainedX = newItem.x;
                            }
                            
                            // Prevent height overflow
                            if (newItem.y + newItem.h > MAX_ROWS) {
                              constrainedH = MAX_ROWS - newItem.y;
                            }
                            
                            // Update layout with constrained values if needed
                            if (constrainedW !== newItem.w || constrainedH !== newItem.h || constrainedX !== newItem.x) {
                              const updatedLayout = layout.map(item => {
                                if (item.i === newItem.i) {
                                  return {
                                    ...item,
                                    w: Math.max(2, constrainedW),
                                    h: Math.max(2, constrainedH),
                                    x: Math.max(0, constrainedX),
                                  };
                                }
                                return item;
                              });
                              setLayout(updatedLayout);
                              saveLayout(updatedLayout);
                            }
                          }}
                        >
                          {layout.map((item) => {
                            const widget = getWidgetById(item.i);
                            if (!widget) return null;
                            
                            return (
                              <div key={item.i} data-grid={item} className="widget-card rounded-lg border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow box-border">
                                {/* Drag handle + actions */}
                                <div className="drag-handle h-8 bg-gray-50 cursor-move flex items-center justify-between px-2 border-b border-gray-100 flex-shrink-0">
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                                    </svg>
                                    <span className="text-xs font-medium text-gray-600 truncate">{widget.title}</span>
                                  </div>
                                  <div className="widget-actions flex gap-0.5">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleEditWidget(widget); }}
                                      className="p-1 hover:bg-white rounded transition-colors"
                                      title="Settings"
                                    >
                                      <svg className="w-3.5 h-3.5 text-gray-500 hover:text-[#54bd95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteWidget(widget.id); }}
                                      className="p-1 hover:bg-red-50 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <svg className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1 p-2 min-h-0 overflow-hidden">
                                  <WidgetRenderer 
                                    widget={widget} 
                                    dateRange={dateFilter}
                                    isConfigMode={true}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </ResponsiveGridLayout>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4">
        <div className="w-full flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={savingLayout || widgets.length === 0}
            className="px-5 py-2 bg-[#54bd95] text-white rounded-lg text-sm font-medium hover:bg-[#48a883] disabled:bg-gray-300 transition-colors flex items-center gap-2"
          >
            {savingLayout ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : 'Save'}
          </button>
        </div>
      </div>

      {/* Config Modals/Panels */}
      {showTableConfigModal && tableConfig && (
        <TableConfigPanel config={tableConfig} onChange={setTableConfig} onClose={() => setShowTableConfigModal(false)} onSave={handleSaveTableWidget} />
      )}
      {showKpiConfigModal && kpiConfig && (
        <KPIConfigPanel config={kpiConfig} onChange={setKpiConfig} onClose={() => setShowKpiConfigModal(false)} onSave={handleSaveKpiWidget} />
      )}
      {showPieChartConfigModal && pieChartConfig && (
        <PieChartConfigPanel config={pieChartConfig} onChange={setPieChartConfig} onClose={() => setShowPieChartConfigModal(false)} onSave={handleSavePieChartWidget} isEditing={!!pieChartConfig.id} />
      )}
      {showChartConfigModal && chartConfig && (
        <ChartSidePanel config={chartConfig} onChange={setChartConfig} onClose={() => setShowChartConfigModal(false)} onSave={handleSaveChartWidget} isEditing={!!chartConfig.id} />
      )}
    </div>
  );
};

// Chart Side Panel Component
const ChartSidePanel = ({ config, onChange, onClose, onSave, isEditing }) => {
  const AXIS_OPTIONS = [
    { value: 'product', label: 'Product' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'unit_price', label: 'Unit Price' },
    { value: 'total_amount', label: 'Total Amount' },
    { value: 'status', label: 'Status' },
    { value: 'created_by', label: 'Created By' },
  ];

  const handleChange = (field, value) => onChange({ ...config, [field]: value });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 side-panel-overlay" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-panel overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit' : 'Add'} {config.chartTypeLabel}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget title <span className="text-red-500">*</span></label>
            <input type="text" value={config.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95]" />
          </div>
          {/* Type (Read only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget type</label>
            <input type="text" value={config.chartTypeLabel} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={config.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95]" />
          </div>
          {/* Widget Size */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Widget size</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width (Columns)</label>
                <input type="number" value={config.width} onChange={(e) => handleChange('width', Math.max(1, parseInt(e.target.value) || 1))} min={1} max={12} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height (Rows)</label>
                <input type="number" value={config.height} onChange={(e) => handleChange('height', Math.max(1, parseInt(e.target.value) || 1))} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
              </div>
            </div>
          </div>
          {/* Data Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Data setting</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Choose X-Axis data <span className="text-red-500">*</span></label>
                <select value={config.xAxis} onChange={(e) => handleChange('xAxis', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 bg-white">
                  {AXIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Choose Y-Axis data <span className="text-red-500">*</span></label>
                <select value={config.yAxis} onChange={(e) => handleChange('yAxis', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 bg-white">
                  {AXIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          {/* Styling */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Styling</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Chart color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.color} onChange={(e) => handleChange('color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <input type="text" value={config.color} onChange={(e) => handleChange('color', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" placeholder="#54bd95" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={config.showLabels} onChange={(e) => handleChange('showLabels', e.target.checked)} className="w-4 h-4 text-[#54bd95] rounded focus:ring-[#54bd95]" />
                <label className="text-sm text-gray-600">Show data label</label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(config)} disabled={!config.title} className="px-5 py-2 bg-[#54bd95] text-white rounded-lg text-sm font-medium hover:bg-[#48a883] disabled:bg-gray-300">
            {isEditing ? 'Update' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureDashboard;
