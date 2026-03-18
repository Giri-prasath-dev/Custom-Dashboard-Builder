import { useState, useRef } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import WidgetRenderer from './WidgetRenderer';
import WidgetConfigPanel from './WidgetConfigPanel';
import ConfirmDialog from './ConfirmDialog';
import { dashboardApi } from '../services/api';

// Grid configuration as per requirements
const GRID_CONFIG = {
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768,
  },
  cols: {
    lg: 12,
    md: 8,
    sm: 4,
  },
  margin: [16, 16],
  rowHeight: 80,
};

const DashboardCanvas = ({ widgets = [], onWidgetsChange, onError, dashboardId, dateRange }) => {
  const containerRef = useRef(null);
  const { width } = useContainerWidth(containerRef);
  
  // Configuration panel state
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, widgetId: null });

  // Convert widgets to layout format
  const layout = widgets.map((widget) => {
    const w = Math.min(widget.width || 4, 12);
    const h = widget.height || 3;
    const x = Math.min(widget.position_x || 0, 12 - w);
    const y = Math.max(widget.position_y || 0, 0);
    return {
      i: String(widget.id),
      x,
      y,
      w,
      h,
      minW: 2,
      minH: 2,
      maxW: 12,
    };
  });

  // Handle layout change from drag/resize
  const handleLayoutChange = async (newLayout) => {
    // Save layout changes to backend
    if (dashboardId && onWidgetsChange) {
      try {
        // Update each widget's position and size
        const updatePromises = newLayout.map((item) => {
          const widgetId = item.i;
          const widget = widgets.find((w) => String(w.id) === widgetId);
          if (widget) {
            return dashboardApi.updateWidget(widgetId, {
              position_x: item.x,
              position_y: item.y,
              width: item.w,
              height: item.h,
            });
          }
          return Promise.resolve();
        });

        await Promise.all(updatePromises);
        
        // Refresh widgets to get updated positions
        const response = await dashboardApi.getWidgets(dashboardId);
        const updatedWidgets = response.data.results || response.data;
        onWidgetsChange(updatedWidgets);
      } catch (err) {
        console.error('Error saving layout:', err);
        onError?.('Failed to save layout changes');
      }
    }
  };

  // Handle widget settings click - open configuration panel
  const handleSettings = (widget) => {
    setSelectedWidget(widget);
    setShowConfigPanel(true);
  };

  // Handle widget configuration save
  const handleConfigSave = async (widgetId, newConfig) => {
    try {
      // Get the widget to merge config
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) return;

      // Merge existing config with new config
      const mergedConfig = {
        ...widget.config,
        ...newConfig,
      };

      // Update widget with new config
      await dashboardApi.updateWidget(widgetId, {
        config: mergedConfig,
      });

      // Refresh widgets
      const response = await dashboardApi.getWidgets(dashboardId);
      const updatedWidgets = response.data.results || response.data;
      onWidgetsChange(updatedWidgets);

      // Update selected widget for panel
      const updatedWidget = updatedWidgets.find(w => w.id === widgetId);
      if (updatedWidget) {
        setSelectedWidget(updatedWidget);
      }
    } catch (err) {
      console.error('Error saving widget config:', err);
      onError?.('Failed to save widget configuration');
    }
  };

  // Handle widget delete from config panel
  const handleDeleteFromConfig = async (widgetId) => {
    try {
      await dashboardApi.deleteWidget(widgetId);
      // Refresh widgets
      const response = await dashboardApi.getWidgets(dashboardId);
      const updatedWidgets = response.data.results || response.data;
      onWidgetsChange(updatedWidgets);
      setShowConfigPanel(false);
      setSelectedWidget(null);
    } catch (err) {
      console.error('Error deleting widget:', err);
      onError?.('Failed to delete widget');
    }
  };

  // Handle widget delete from renderer - show confirmation dialog
  const handleDeleteClick = (widgetId) => {
    setConfirmDialog({ isOpen: true, widgetId });
  };

  // Handle confirmed widget delete
  const handleConfirmDelete = async () => {
    const widgetId = confirmDialog.widgetId;
    setConfirmDialog({ isOpen: false, widgetId: null });
    try {
      await dashboardApi.deleteWidget(widgetId);
      // Refresh widgets
      const response = await dashboardApi.getWidgets(dashboardId);
      const updatedWidgets = response.data.results || response.data;
      onWidgetsChange(updatedWidgets);
    } catch (err) {
      console.error('Error deleting widget:', err);
      onError?.('Failed to delete widget');
    }
  };

  // Check if layout is empty or invalid
  const isLayoutValid = layout && Array.isArray(layout) && layout.length > 0;

  // Get widget by ID
  const getWidgetById = (id) => {
    return widgets.find((w) => String(w.id) === String(id));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Render grid when container has width and layout is valid */}
      {width > 0 && isLayoutValid ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout, md: layout, sm: layout }}
          breakpoints={GRID_CONFIG.breakpoints}
          cols={GRID_CONFIG.cols}
          rowHeight={GRID_CONFIG.rowHeight}
          width={width}
          margin={GRID_CONFIG.margin}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          isBounded={true}
          preventCollision={true}
          compactType="vertical"
          useCSSTransforms={true}
          // Placeholder styling
          placeholder={
            <div
              className="bg-primary-50 border-2 border-dashed border-primary-300 rounded-xl"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
              }}
            />
          }
        >
          {layout.map((item) => {
            const widget = getWidgetById(item.i);
            if (!widget) return null;
            
            return (
              <div key={item.i} data-grid={item} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow box-border">
                <WidgetRenderer 
                  widget={widget} 
                  onSettings={handleSettings}
                  onDeleteConfirm={handleDeleteClick}
                  dateRange={dateRange}
                />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      ) : (
        /* Fallback for zero width (loading state) */
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400">Loading grid...</p>
        </div>
      )}

      {/* Widget Configuration Panel */}
      <WidgetConfigPanel
        widget={selectedWidget}
        isOpen={showConfigPanel}
        onClose={() => {
          setShowConfigPanel(false);
          setSelectedWidget(null);
        }}
        onSave={handleConfigSave}
        onDelete={handleDeleteFromConfig}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Widget"
        message="Are you sure you want to delete this widget? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, widgetId: null })}
      />
    </div>
  );
};

export default DashboardCanvas;
