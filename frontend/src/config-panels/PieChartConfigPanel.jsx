import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GROUP_FIELD_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'unit_price', label: 'Unit Price' },
  { value: 'total_amount', label: 'Total Amount' },
  { value: 'status', label: 'Status' },
  { value: 'created_by', label: 'Created By' },
];

const COLORS = ['#54bd95', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const MOCK_DATA = [
  { product: 'Fiber Internet 300 Mbps', quantity: 25, unit_price: 49.99, total_amount: 1249.75, status: 'Completed', created_by: 'Mr. Michael Harris' },
  { product: '5G Unlimited Mobile Plan', quantity: 50, unit_price: 79.99, total_amount: 3999.50, status: 'Pending', created_by: 'Mr. Ryan Cooper' },
  { product: 'Fiber Internet 1 Gbps', quantity: 30, unit_price: 89.99, total_amount: 2699.70, status: 'Completed', created_by: 'Ms. Olivia Carter' },
  { product: 'Business Internet 500 Mbps', quantity: 15, unit_price: 129.99, total_amount: 1949.85, status: 'In Progress', created_by: 'Mr. Lucas Martin' },
  { product: 'VoIP Corporate Package', quantity: 40, unit_price: 59.99, total_amount: 2399.60, status: 'Completed', created_by: 'Mr. Michael Harris' },
];

const PieChartConfigPanel = ({ config, onChange, onClose, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: config?.title || 'Untitled',
    description: config?.description || '',
    width: config?.width || 4,
    height: config?.height || 4,
    groupBy: config?.group_by || 'product',
    aggregation: config?.aggregation || 'count',
    showLegend: config?.showLegend !== undefined ? config.showLegend : true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Please fill the field';
    if (!formData.groupBy) newErrors.groupBy = 'Please select a field';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        id: config?.id || null, type: 'pie_chart',
        title: formData.title, description: formData.description,
        group_by: formData.groupBy, aggregation: formData.aggregation,
        showLegend: formData.showLegend,
        width: formData.width, height: formData.height,
        layout: { x: 0, y: 0, w: formData.width, h: formData.height },
      });
    }
  };

  const previewData = useMemo(() => {
    const grouped = {};
    MOCK_DATA.forEach(item => {
      const key = String(item[formData.groupBy] || 'Unknown');
      if (!grouped[key]) grouped[key] = { name: key, value: 0 };
      if (formData.aggregation === 'count') {
        grouped[key].value += 1;
      } else {
        const numField = ['quantity', 'unit_price', 'total_amount'].includes(formData.groupBy) ? formData.groupBy : null;
        grouped[key].value += numField ? (item[numField] || 0) : 1;
      }
    });
    return Object.values(grouped).map((item, i) => ({ ...item, fill: COLORS[i % COLORS.length] }));
  }, [formData.groupBy, formData.aggregation]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 side-panel-overlay" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-panel overflow-y-auto animate-slide-in custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit' : 'Add'} Pie Chart</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3" style={{ height: 200 }}>
            {previewData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={previewData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={formData.showLegend ? 50 : 65} label={!formData.showLegend}>
                    {previewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                  {formData.showLegend && <Legend wrapperStyle={{ fontSize: '10px' }} />}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget title <span className="text-red-500">*</span></label>
            <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.title ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#54bd95]/30 focus:border-[#54bd95]'}`} placeholder="Untitled" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget type</label>
            <input type="text" value="Pie chart" disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" placeholder="Optional description..." />
          </div>

          {/* Size */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Widget size</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width (Columns)</label>
                <input type="number" min={1} max={12} value={formData.width} onChange={(e) => handleChange('width', Math.max(1, parseInt(e.target.value) || 4))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height (Rows)</label>
                <input type="number" min={1} max={12} value={formData.height} onChange={(e) => handleChange('height', Math.max(1, parseInt(e.target.value) || 4))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
              </div>
            </div>
          </div>

          {/* Data */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Data setting</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Choose chart data <span className="text-red-500">*</span></label>
                <select value={formData.groupBy} onChange={(e) => handleChange('groupBy', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white ${errors.groupBy ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#54bd95]/30'}`}>
                  <option value="">Select a field...</option>
                  {GROUP_FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.groupBy && <p className="text-xs text-red-500 mt-1">{errors.groupBy}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.showLegend} onChange={(e) => handleChange('showLegend', e.target.checked)}
                  className="w-4 h-4 text-[#54bd95] rounded focus:ring-[#54bd95]" />
                <label className="text-sm text-gray-600">Show legend</label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={!formData.title} className="px-5 py-2 bg-[#54bd95] text-white rounded-lg text-sm font-medium hover:bg-[#48a883] disabled:bg-gray-300">
            {isEditing ? 'Update' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PieChartConfigPanel;
