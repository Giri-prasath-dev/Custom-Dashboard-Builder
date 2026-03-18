import { useState, useEffect, useCallback, useRef } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { debounce } from 'lodash';
import WidgetRenderer from './WidgetRenderer';
import { dashboardApi } from '../services/api';

const DashboardGrid = ({ widgets, dashboardId, onWidgetsChange, onError, dateRange }) => {
  const [layout, setLayout] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef(null);
  const { width } = useContainerWidth(containerRef);

  // Convert widgets to layout format
  useEffect(() => {
    if (widgets && widgets.length > 0) {
      const newLayout = widgets.map((widget) => ({
        i: String(widget.id),
        x: widget.position_x || 0,
        y: widget.position_y || 0,
        w: widget.width || 4,
        h: widget.height || 3,
        minW: 2,
        minH: 2,
      }));
      setLayout(newLayout);
    } else {
      setLayout([]);
    }
  }, [widgets]);

  // Debounced save function to avoid too many API calls
  const saveLayout = useCallback(
    debounce(async (newLayout) => {
      if (!dashboardId) return;
      
      setIsSaving(true);
      try {
        // Update each widget's position and size
        const updatePromises = newLayout.map((item) => {
          const widgetId = item.i;
          return dashboardApi.updateWidget(widgetId, {
            position_x: item.x,
            position_y: item.y,
            width: item.w,
            height: item.h,
          });
        });

        await Promise.all(updatePromises);
        
        // Refresh widgets to get updated data
        const response = await dashboardApi.getWidgets(dashboardId);
        const updatedWidgets = response.data.results || response.data;
        onWidgetsChange(updatedWidgets);
      } catch (err) {
        console.error('Error saving layout:', err);
        onError?.('Failed to save layout changes');
      } finally {
        setIsSaving(false);
      }
    }, 500),
    [dashboardId]
  );

  // Handle layout change
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

  // Handle widget delete
  const handleDeleteWidget = async (widgetId) => {
    if (!window.confirm('Are you sure you want to delete this widget?')) return;
    
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

  // Get widget by ID
  const getWidgetById = (id) => {
    return widgets.find((w) => String(w.id) === String(id));
  };

  if (!widgets || widgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No widgets in this dashboard. Go to Configure Dashboard to add widgets.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {isSaving && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Saving layout...
        </div>
      )}
      {width > 0 && (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 8, sm: 4, xs: 4 }}
          rowHeight={80}
          width={width}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          isResizable={true}
          isDraggable={true}
          isBounded={true}
          margin={[16, 16]}
          preventCollision={true}
          compactType="vertical"
          onResizeStop={(layout, oldItem, newItem, placeholder, event, element) => {
            // FIX OVERFLOW: Constrain widget to grid bounds after resize
            const MAX_COLS = 12;
            const MAX_ROWS = 20;
            
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
              <div key={item.i} className="relative box-border overflow-hidden">
                {/* Drag handle */}
                <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-100 rounded-t-lg cursor-move z-10 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">⋮⋮</span>
                </div>
                <div className="pt-6 h-full overflow-hidden">
                  <WidgetRenderer 
                    widget={widget} 
                    onDelete={handleDeleteWidget}
                    dateRange={dateRange}
                  />
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};

export default DashboardGrid;
