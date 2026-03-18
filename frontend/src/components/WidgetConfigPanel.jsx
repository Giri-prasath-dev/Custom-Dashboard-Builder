import { useState, useEffect } from 'react';
import { getConfigPanel, hasConfigPanel, defaultConfigs } from '../registry/configRegistry';

const WidgetConfigPanel = ({ widget, isOpen, onClose, onSave, onDelete }) => {
  const [config, setConfig] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize config when widget changes
  useEffect(() => {
    if (widget) {
      // Use existing config or get default config
      const defaultConfig = defaultConfigs[widget.type] || {};
      setConfig(widget.config || defaultConfig);
    }
  }, [widget]);

  if (!isOpen || !widget) return null;

  const ConfigComponent = getConfigPanel(widget.type);
  const hasConfig = hasConfigPanel(widget.type);

  // Check if this is a KPI widget - use modal directly
  const isKpiWidget = widget.type === 'kpi' || widget.type === 'orders_summary';
  
  // Check if this is a Table widget - use modal directly
  const isTableWidget = widget.type === 'table';

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(widget.id, config);
      onClose();
    } catch (err) {
      console.error('Error saving widget config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      onDelete(widget.id);
      onClose();
    }
  };

  // For KPI widgets, show full modal configuration directly
  if ((isKpiWidget || isTableWidget) && ConfigComponent) {
    return (
      <ConfigComponent
        config={config}
        onChange={handleConfigChange}
        onClose={onClose}
        onSave={async (tableConfig) => {
          setSaving(true);
          try {
            await onSave(widget.id, tableConfig);
            onClose();
          } catch (err) {
            console.error('Error saving widget config:', err);
          } finally {
            setSaving(false);
          }
        }}
      />
    );
  }

  // For other widgets, use the standard side panel
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Widget Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Configuration Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasConfig ? (
          <div className="text-center text-gray-500 py-8">
            <p>No configuration available for this widget type.</p>
            <p className="text-sm mt-2">Type: {widget.type}</p>
          </div>
        ) : ConfigComponent ? (
          <ConfigComponent config={config} onChange={handleConfigChange} />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Configuration component not found.</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
          >
            Delete Widget
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfigPanel;
