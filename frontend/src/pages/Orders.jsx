import { useState, useEffect } from 'react';
import { ordersApi } from '../services/api';
import OrderFormModal from '../components/OrderFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, orderId: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const response = await ordersApi.getOrders(params);
      setOrders(response.data.results || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const handleCreateClick = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (orderId) => {
    setOpenMenuId(null);
    setConfirmDialog({ isOpen: true, orderId });
  };

  const handleConfirmDelete = async () => {
    const orderId = confirmDialog.orderId;
    setConfirmDialog({ isOpen: false, orderId: null });
    try {
      await ordersApi.deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      showToast('Order deleted successfully');
    } catch (err) {
      console.error('Error deleting order:', err);
      showToast(err.response?.data?.detail || 'Failed to delete order', 'error');
    }
  };

  const handleSubmitOrder = async (formData) => {
    try {
      if (editingOrder) {
        await ordersApi.updateOrder(editingOrder.id, formData);
        showToast('Order updated successfully');
      } else {
        await ordersApi.createOrder(formData);
        showToast('Order created successfully');
      }
      await fetchOrders();
      setIsModalOpen(false);
      setEditingOrder(null);
    } catch (err) {
      console.error('Error saving order:', err);
      showToast(err.response?.data?.detail || 'Failed to save order', 'error');
      throw err;
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersApi.updateOrder(orderId, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      showToast('Status updated');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const getFullAddress = (order) => {
    const parts = [];
    if (order.address) parts.push(order.address);
    if (order.city) parts.push(order.city);
    if (order.state) parts.push(order.state);
    if (order.postal_code) parts.push(order.postal_code);
    if (order.country) parts.push(order.country);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.first_name?.toLowerCase().includes(searchLower) ||
      order.last_name?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower) ||
      order.product?.toLowerCase().includes(searchLower)
    );
  });

  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-100 rounded-t-lg"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 border-b border-gray-100 flex items-center px-4 gap-6">
          <div className="w-12 h-3.5 bg-gray-100 rounded"></div>
          <div className="w-28 h-3.5 bg-gray-100 rounded"></div>
          <div className="w-36 h-3.5 bg-gray-100 rounded"></div>
          <div className="w-20 h-3.5 bg-gray-100 rounded"></div>
          <div className="w-24 h-3.5 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, orderId: null })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your customer orders and track status</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-[#54bd95] text-white rounded-lg hover:bg-[#48a883] transition-colors flex items-center gap-2 shadow-sm text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Order
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95] text-sm transition-shadow"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95] bg-white text-sm"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 mx-auto bg-[#ecfdf5] rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#54bd95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-sm text-gray-500 mb-6">Click Create Order to add your first order</p>
          <button
            onClick={handleCreateClick}
            className="px-5 py-2 bg-[#54bd95] text-white rounded-lg hover:bg-[#48a883] transition-colors inline-flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Order
          </button>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <TableSkeleton />
        </div>
      ) : orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Order ID', 'Customer Name', 'Email', 'Phone', 'Product', 'Qty', 'Order Date', 'Address', 'Unit Price', 'Total', 'Status', 'Created By', 'Actions'].map((header) => (
                    <th key={header} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${header === 'Address' ? 'min-w-[200px]' : ''} ${header === 'Product' ? 'min-w-[150px]' : ''} ${header === 'Order Date' ? 'min-w-[120px]' : ''}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900">{order.first_name} {order.last_name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{order.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{order.phone || '-'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{order.product}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 text-center">{order.quantity}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-pre-line">{getFullAddress(order)}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">${parseFloat(order.unit_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-[#54bd95]">${parseFloat(order.total_amount || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{order.created_by_username || '-'}</td>
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === order.id ? null : order.id); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </button>
                        {openMenuId === order.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => handleEditClick(order)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(order.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (searchTerm || statusFilter) && (
            <div className="text-center py-8 text-sm text-gray-500">No orders match your filters.</div>
          )}
        </div>
      )}

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingOrder(null); }}
        onSubmit={handleSubmitOrder}
        initialData={editingOrder}
      />
    </div>
  );
};

export default Orders;
