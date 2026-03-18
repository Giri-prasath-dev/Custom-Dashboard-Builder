import { useState, useMemo } from 'react';

// Available columns from Order Data matching spec
const ORDER_DATA_FIELDS = [
  { value: 'customer_id', label: 'Customer ID' },
  { value: 'customer_name', label: 'Customer Name' },
  { value: 'email_id', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Address' },
  { value: 'order_id', label: 'Order ID' },
  { value: 'order_date', label: 'Order Date' },
  { value: 'product', label: 'Product' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'unit_price', label: 'Unit Price' },
  { value: 'total_amount', label: 'Total Amount' },
  { value: 'status', label: 'Status' },
  { value: 'created_by', label: 'Created By' },
];

const FILTER_ATTRIBUTES = [
  { value: 'product', label: 'Product' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'status', label: 'Status' },
];

const FILTER_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'lt', label: '<' },
  { value: 'contains', label: 'Contains' },
];

const HEADER_COLORS = [
  { value: '#54bd95', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#E6E8EB', label: 'Gray' },
];

const TableConfigPanel = ({ config, onChange, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('data');
  const [errors, setErrors] = useState({});
  const [showFilters, setShowFilters] = useState(config.filters?.length > 0 || false);
  const [newFilter, setNewFilter] = useState({ field: 'status', operator: 'equals', value: '' });
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  const mergedConfig = useMemo(() => {
    return {
      title: 'Untitled', type: 'table', description: '', width: 4, height: 4,
      columns: [], pagination: 5, filters: [],
      ...config,
      sort: { field: '', order: 'asc', ...config?.sort },
      style: { fontSize: 14, headerColor: '#54bd95', ...config?.style },
    };
  }, [config]);

  const handleChange = (field, value) => {
    if (field.startsWith('style.')) {
      onChange({ ...mergedConfig, style: { ...mergedConfig.style, [field.replace('style.', '')]: value } });
    } else if (field.startsWith('sort.')) {
      onChange({ ...mergedConfig, sort: { ...mergedConfig.sort, [field.replace('sort.', '')]: value } });
    } else {
      onChange({ ...mergedConfig, [field]: value });
    }
  };

  const handleColumnToggle = (columnValue) => {
    const currentColumns = mergedConfig.columns || [];
    const newColumns = currentColumns.includes(columnValue)
      ? currentColumns.filter(c => c !== columnValue)
      : [...currentColumns, columnValue];
    handleChange('columns', newColumns);
    if (newColumns.length > 0) setErrors(prev => ({ ...prev, columns: null }));
  };

  const addFilter = () => {
    if (newFilter.field && newFilter.value) {
      handleChange('filters', [...(mergedConfig.filters || []), { ...newFilter, id: Date.now() }]);
      setNewFilter({ field: 'status', operator: 'equals', value: '' });
    }
  };

  const removeFilter = (filterId) => {
    handleChange('filters', (mergedConfig.filters || []).filter(f => f.id !== filterId));
  };

  const validate = () => {
    const newErrors = {};
    if (!mergedConfig.title?.trim()) newErrors.title = 'Please fill the field';
    if (!mergedConfig.columns?.length) newErrors.columns = 'Select at least one column';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        id: mergedConfig.id, type: 'table', title: mergedConfig.title,
        description: mergedConfig.description,
        columns: mergedConfig.columns,
        sort: mergedConfig.sort?.field ? mergedConfig.sort : null,
        pagination: mergedConfig.pagination, filters: mergedConfig.filters || [],
        style: mergedConfig.style,
        width: mergedConfig.width || 4, height: mergedConfig.height || 4,
        layout: { x: 0, y: 0, w: mergedConfig.width || 4, h: mergedConfig.height || 4 },
      });
    }
  };

  const getColumnLabel = (value) => ORDER_DATA_FIELDS.find(f => f.value === value)?.label || value;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 side-panel-overlay" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-panel overflow-y-auto animate-slide-in custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{config?.id ? 'Edit' : 'Add'} Table Widget</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {['data', 'styling'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-[#54bd95] border-b-2 border-[#54bd95]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >{tab}</button>
          ))}
        </div>

        <div className="p-6">
          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget title <span className="text-red-500">*</span></label>
                <input type="text" value={mergedConfig.title || ''} onChange={(e) => { handleChange('title', e.target.value); if (e.target.value.trim()) setErrors(prev => ({ ...prev, title: null })); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.title ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#54bd95]/30 focus:border-[#54bd95]'}`} placeholder="Untitled" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Type (Read only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget type</label>
                <input type="text" value="Table" disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={mergedConfig.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95]" placeholder="Optional description..." />
              </div>

              {/* Widget Size */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Widget size</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Width (Columns)</label>
                    <input type="number" min={1} max={12} value={mergedConfig.width || 4} onChange={(e) => handleChange('width', parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Height (Rows)</label>
                    <input type="number" min={1} max={20} value={mergedConfig.height || 4} onChange={(e) => handleChange('height', parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30" />
                  </div>
                </div>
              </div>

              {/* Columns */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Data setting</h3>
                <label className="block text-xs text-gray-500 mb-1">Choose columns <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
                    className={`w-full px-3 py-2 border rounded-lg cursor-pointer min-h-[42px] flex flex-wrap gap-1 ${errors.columns ? 'border-red-300' : 'border-gray-200'}`}>
                    {(mergedConfig.columns || []).length === 0
                      ? <span className="text-gray-400 text-sm">Select columns...</span>
                      : mergedConfig.columns.map(col => (
                          <span key={col} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ecfdf5] text-[#047857] text-xs rounded-full">
                            {getColumnLabel(col)}
                            <button onClick={(e) => { e.stopPropagation(); handleColumnToggle(col); }} className="hover:text-red-500">&times;</button>
                          </span>
                        ))
                    }
                  </div>
                  {columnDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {ORDER_DATA_FIELDS.map(field => (
                        <label key={field.value} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                          <input type="checkbox" checked={(mergedConfig.columns || []).includes(field.value)} onChange={() => handleColumnToggle(field.value)}
                            className="w-4 h-4 text-[#54bd95] rounded focus:ring-[#54bd95]" />
                          {field.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.columns && <p className="text-xs text-red-500 mt-1">{errors.columns}</p>}
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sort by</label>
                <div className="flex gap-2">
                  <select value={mergedConfig.sort?.order || 'asc'} onChange={(e) => handleChange('sort.order', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 bg-white">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                    <option value="order_date">Order date</option>
                  </select>
                </div>
              </div>

              {/* Pagination */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Pagination <span className="text-red-500">*</span></label>
                <select value={mergedConfig.pagination || 5} onChange={(e) => handleChange('pagination', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 bg-white">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>

              {/* Filters */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showFilters} onChange={(e) => setShowFilters(e.target.checked)}
                    className="w-4 h-4 text-[#54bd95] rounded focus:ring-[#54bd95]" />
                  <span className="text-sm text-gray-700 font-medium">Apply filter</span>
                </label>
                {showFilters && (
                  <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg">
                    {(mergedConfig.filters || []).map(filter => (
                      <div key={filter.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 text-sm">
                        <span className="flex-1"><strong>{filter.field}</strong> {filter.operator} "<em>{filter.value}</em>"</span>
                        <button onClick={() => removeFilter(filter.id)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </div>
                    ))}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Attribute</label>
                        <select value={newFilter.field} onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg">
                          {FILTER_ATTRIBUTES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div className="w-20">
                        <label className="block text-xs text-gray-400 mb-1">Op</label>
                        <select value={newFilter.operator} onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg">
                          {FILTER_OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Value</label>
                        <input type={newFilter.field === 'quantity' ? 'number' : 'text'} value={newFilter.value}
                          onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })} placeholder="Value"
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" />
                      </div>
                      <button onClick={addFilter} disabled={!newFilter.value}
                        className="px-3 py-1.5 text-sm bg-[#54bd95] text-white rounded-lg hover:bg-[#48a883] disabled:bg-gray-300">Add</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STYLING TAB */}
          {activeTab === 'styling' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font size (px)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={12} max={18} value={mergedConfig.style?.fontSize || 14}
                    onChange={(e) => handleChange('style.fontSize', parseInt(e.target.value))}
                    className="flex-1 accent-[#54bd95]" />
                  <span className="text-sm font-medium text-gray-700 w-8 text-center">{mergedConfig.style?.fontSize || 14}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header background</label>
                <div className="flex gap-2 flex-wrap">
                  {HEADER_COLORS.map(color => (
                    <button key={color.value} onClick={() => handleChange('style.headerColor', color.value)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${mergedConfig.style?.headerColor === color.value ? 'ring-2 ring-offset-2 ring-[#54bd95]' : 'border-gray-200'}`}
                      style={{ backgroundColor: color.value }} title={color.label} />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input type="color" value={mergedConfig.style?.headerColor || '#54bd95'} onChange={(e) => handleChange('style.headerColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0" />
                  <span className="text-xs text-gray-500 font-mono">{mergedConfig.style?.headerColor || '#54bd95'}</span>
                </div>
              </div>
            </div>
          )}
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

export default TableConfigPanel;
