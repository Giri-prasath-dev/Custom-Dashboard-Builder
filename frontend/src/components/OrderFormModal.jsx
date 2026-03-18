import { useState, useEffect } from 'react';

// Dropdown options per specification
const COUNTRY_OPTIONS = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'];
const PRODUCT_OPTIONS = [
  'Fiber Internet 300 Mbps',
  '5G Unlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package',
];
const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
const CREATED_BY_OPTIONS = [
  'Mr. Michael Harris',
  'Mr. Ryan Cooper',
  'Ms. Olivia Carter',
  'Mr. Lucas Martin',
];

const initialFormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'United States',
  product: 'Fiber Internet 300 Mbps',
  quantity: 1,
  unit_price: '',
  status: 'Pending',
  created_by_username: 'Mr. Michael Harris',
};

const OrderFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          first_name: initialData.first_name || '',
          last_name: initialData.last_name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          city: initialData.city || '',
          state: initialData.state || '',
          postal_code: initialData.postal_code || '',
          country: initialData.country || 'United States',
          product: initialData.product || 'Fiber Internet 300 Mbps',
          quantity: initialData.quantity || 1,
          unit_price: initialData.unit_price || '',
          status: initialData.status || 'Pending',
          created_by_username: initialData.created_by_username || 'Mr. Michael Harris',
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const totalAmount = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.unit_price) || 0);

  const validate = () => {
    const newErrors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country', 'product', 'unit_price', 'created_by_username'];
    
    requiredFields.forEach(field => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = 'Please fill the field';
      }
    });

    if (formData.quantity < 1) {
      newErrors.quantity = 'Cannot be less than 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        total_amount: totalAmount,
      });
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-shadow ${
      errors[field]
        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
        : 'border-gray-200 focus:ring-[#54bd95]/30 focus:border-[#54bd95]'
    }`;

  const selectClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white transition-shadow ${
      errors[field]
        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
        : 'border-gray-200 focus:ring-[#54bd95]/30 focus:border-[#54bd95]'
    }`;

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-200 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Edit Order' : 'Create Order'}
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#54bd95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">First name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} className={inputClass('first_name')} placeholder="John" />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} className={inputClass('last_name')} placeholder="Doe" />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={inputClass('email')} placeholder="john@example.com" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone number <span className="text-red-500">*</span></label>
                <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className={inputClass('phone')} placeholder="+1 (555) 000-0000" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Street Address <span className="text-red-500">*</span></label>
                <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className={inputClass('address')} placeholder="123 Main St" />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">City <span className="text-red-500">*</span></label>
                <input type="text" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className={inputClass('city')} placeholder="New York" />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">State / Province <span className="text-red-500">*</span></label>
                <input type="text" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} className={inputClass('state')} placeholder="NY" />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>
              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Postal code <span className="text-red-500">*</span></label>
                <input type="text" value={formData.postal_code} onChange={(e) => handleChange('postal_code', e.target.value)} className={inputClass('postal_code')} placeholder="10001" />
                {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code}</p>}
              </div>
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Country <span className="text-red-500">*</span></label>
                <select value={formData.country} onChange={(e) => handleChange('country', e.target.value)} className={selectClass('country')}>
                  {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#54bd95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Choose product <span className="text-red-500">*</span></label>
                <select value={formData.product} onChange={(e) => handleChange('product', e.target.value)} className={selectClass('product')}>
                  {PRODUCT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
              </div>
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className={inputClass('quantity')}
                  min={1}
                />
                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
              </div>
              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Unit price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleChange('unit_price', e.target.value)}
                    className={`${inputClass('unit_price')} pl-7`}
                    placeholder="0.00"
                  />
                </div>
                {errors.unit_price && <p className="text-xs text-red-500 mt-1">{errors.unit_price}</p>}
              </div>
              {/* Total Amount (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Total amount</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-semibold">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status <span className="text-red-500">*</span></label>
                <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className={selectClass('status')}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Created By */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Created by <span className="text-red-500">*</span></label>
                <select value={formData.created_by_username} onChange={(e) => handleChange('created_by_username', e.target.value)} className={selectClass('created_by_username')}>
                  {CREATED_BY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.created_by_username && <p className="text-xs text-red-500 mt-1">{errors.created_by_username}</p>}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-[#54bd95] text-white rounded-lg text-sm font-medium hover:bg-[#48a883] disabled:bg-gray-300 transition-colors"
          >
            {submitting ? 'Saving...' : (initialData ? 'Update Order' : 'Submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFormModal;
