import { useState, useEffect } from 'react';
import { dataFields, aggregationOptions, formatOptions } from '../registry/configRegistry';

const KPIConfigPanel = ({ config, onChange, onClose, onSave }) => {
  const [localConfig, setLocalConfig] = useState({
    id: config?.id || null,
    title: config?.title || 'Untitled',
    type: 'kpi',
    description: config?.description || '',
    width: config?.width || 2,
    height: config?.height || 2,
    metric: config?.metric || '',
    aggregation: config?.aggregation || 'COUNT',
    format: config?.format || 'number',
    precision: config?.precision ?? 0,
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLocalConfig({
      id: config?.id || null,
      title: config?.title || 'Untitled',
      type: 'kpi',
      description: config?.description || '',
      width: config?.width || 2,
      height: config?.height || 2,
      metric: config?.metric || '',
      aggregation: config?.aggregation || 'COUNT',
      format: config?.format || 'number',
      precision: config?.precision ?? 0,
    });
  }, [config]);

  const handleChange = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!localConfig.title?.trim()) newErrors.title = 'Please fill the field';
    if (!localConfig.metric) newErrors.metric = 'Please fill the field';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ ...localConfig, layout: { w: localConfig.width, h: localConfig.height } });
    }
  };

  const getPreviewValue = () => {
    if (!localConfig.metric) return '--';
    const mockValues = {
      'first_name': '10', 'email': '10', 'address': '10',
      'created_at': '10', 'product': '5', 'created_by_username': '4',
      'status': '3', 'total_amount': '2,450.00',
      'unit_price': '150.00', 'quantity': '15',
    };
    let value = mockValues[localConfig.metric] || '0';
    if (localConfig.format === 'currency' && !['created_at', 'product', 'address', 'email', 'first_name'].includes(localConfig.metric)) {
      value = `$${value}`;
    }
    return value;
  };

  const getMetricLabel = () => {
    const field = dataFields.kpi.find(f => f.value === localConfig.metric);
    return field?.label || localConfig.metric;
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-shadow ${
      errors[field] ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#54bd95]/30 focus:border-[#54bd95]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 side-panel-overlay" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-panel overflow-y-auto animate-slide-in custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{config?.id ? 'Edit' : 'Add'} KPI Widget</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preview */}
          <div className="bg-[#ecfdf5] rounded-lg border border-[#54bd95]/20 p-4">
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">{localConfig.title || 'Untitled'}</span>
              <span className="text-3xl font-bold text-gray-900">{getPreviewValue()}</span>
              {localConfig.metric && (
                <span className="text-xs text-gray-500 block mt-1">{getMetricLabel()} ({localConfig.aggregation})</span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget title <span className="text-red-500">*</span></label>
            <input type="text" value={localConfig.title} onChange={(e) => handleChange('title', e.target.value)} className={inputClass('title')} placeholder="Untitled" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Type (Read only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget type</label>
            <input type="text" value="KPI" disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={localConfig.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95]" placeholder="Add description..." />
          </div>

          {/* Widget Size */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Widget size</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width (Columns)</label>
                <input type="number" min={1} max={12} value={localConfig.width} onChange={(e) => handleChange('width', Math.max(1, parseInt(e.target.value) || 2))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height (Rows)</label>
                <input type="number" min={1} max={12} value={localConfig.height} onChange={(e) => handleChange('height', Math.max(1, parseInt(e.target.value) || 2))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
              </div>
            </div>
          </div>

          {/* Data Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Data setting</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Select metric <span className="text-red-500">*</span></label>
                <select value={localConfig.metric} onChange={(e) => handleChange('metric', e.target.value)} className={`${inputClass('metric')} bg-white`}>
                  <option value="">Select Metric</option>
                  {dataFields.kpi.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                {errors.metric && <p className="text-xs text-red-500 mt-1">{errors.metric}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Aggregation <span className="text-red-500">*</span></label>
                <select value={localConfig.aggregation} onChange={(e) => handleChange('aggregation', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 bg-white">
                  {aggregationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data format <span className="text-red-500">*</span></label>
                <select value={localConfig.format} onChange={(e) => handleChange('format', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 bg-white">
                  {formatOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Decimal precision <span className="text-red-500">*</span></label>
                <input type="number" min={0} max={10} value={localConfig.precision} onChange={(e) => handleChange('precision', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-[#54bd95] text-white rounded-lg text-sm font-medium hover:bg-[#48a883]">
            {config?.id ? 'Update' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPIConfigPanel;
