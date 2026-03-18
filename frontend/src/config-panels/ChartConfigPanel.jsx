import { dataFields, chartColorOptions } from '../registry/configRegistry';

const ChartConfigPanel = ({ config, onChange, widgetType }) => {
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  // Different options for different chart types
  const isScatterChart = widgetType === 'scatter_chart';
  const isPieChart = widgetType === 'pie_chart';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        {isPieChart ? 'Pie Chart' : isScatterChart ? 'Scatter Plot' : 'Chart'} Configuration
      </h3>

      {/* Widget Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Widget Title
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Monthly Revenue"
        />
      </div>

      {!isPieChart && (
        <>
          {/* X Axis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isScatterChart ? 'X Axis' : 'X Axis (Categories)'}
            </label>
            <select
              value={config.xAxis || 'month'}
              onChange={(e) => handleChange('xAxis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dataFields.categorical.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          {/* Y Axis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isScatterChart ? 'Y Axis' : 'Y Axis (Values)'}
            </label>
            <select
              value={config.yAxis || 'total_amount'}
              onChange={(e) => handleChange('yAxis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dataFields.numeric.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Chart Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chart Color
        </label>
        <div className="flex flex-wrap gap-2">
          {chartColorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => handleChange('color', color.value)}
              className={`w-8 h-8 rounded-full ${color.className} ${
                config.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
              title={color.label}
            />
          ))}
        </div>
        <input
          type="color"
          value={config.color || '#3b82f6'}
          onChange={(e) => handleChange('color', e.target.value)}
          className="mt-2 w-full h-10 cursor-pointer"
          title="Custom color"
        />
      </div>

      {!isPieChart && !isScatterChart && (
        <>
          {/* Show Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Data Labels
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showLabels || false}
                onChange={(e) => handleChange('showLabels', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Display values on chart elements
              </span>
            </div>
          </div>

          {/* Series Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Series 1 Label
            </label>
            <input
              type="text"
              value={config.label1 || ''}
              onChange={(e) => handleChange('label1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Current Year"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Series 2 Label
            </label>
            <input
              type="text"
              value={config.label2 || ''}
              onChange={(e) => handleChange('label2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Previous Year"
            />
          </div>
        </>
      )}

      {isPieChart && (
        <>
          {/* Show Legend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Legend
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showLegend !== false}
                onChange={(e) => handleChange('showLegend', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Display legend below chart
              </span>
            </div>
          </div>

          {/* Show Percentage Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Percentage Labels
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showPercentLabel !== false}
                onChange={(e) => handleChange('showPercentLabel', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Display percentage on pie slices
              </span>
            </div>
          </div>

          {/* Inner/Outer Radius */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inner Radius
              </label>
              <input
                type="number"
                value={config.innerRadius || 0}
                onChange={(e) => handleChange('innerRadius', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
                max={80}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outer Radius
              </label>
              <input
                type="number"
                value={config.outerRadius || 80}
                onChange={(e) => handleChange('outerRadius', parseInt(e.target.value) || 80)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={50}
                max={100}
              />
            </div>
          </div>
        </>
      )}

      {isScatterChart && (
        <>
          {/* Axis Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X Axis Label
            </label>
            <input
              type="text"
              value={config.xLabel || ''}
              onChange={(e) => handleChange('xLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Quantity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y Axis Label
            </label>
            <input
              type="text"
              value={config.yLabel || ''}
              onChange={(e) => handleChange('yLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Amount"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChartConfigPanel;
