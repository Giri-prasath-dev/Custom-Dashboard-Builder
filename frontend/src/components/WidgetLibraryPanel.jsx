import { widgetLibrary, getDefaultDimensions } from '../registry/widgetRegistry';

const WidgetLibraryPanel = ({ onSelectWidget, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleWidgetSelect = (widgetType) => {
    const dimensions = getDefaultDimensions(widgetType);
    onSelectWidget({
      type: widgetType,
      width: dimensions.w,
      height: dimensions.h,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Widget</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Select a widget type to add to your dashboard:
        </p>

        {/* Widget Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1">
          {widgetLibrary.map((widget) => (
            <button
              key={widget.type}
              onClick={() => handleWidgetSelect(widget.type)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {widget.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{widget.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{widget.description}</p>
              <div className="mt-2 text-xs text-gray-400">
                Size: {widget.defaultWidth} × {widget.defaultHeight}
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
              Chart Widgets
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
              Table Widget
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></span>
              KPI Widget
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetLibraryPanel;
