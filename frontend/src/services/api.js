import axios from 'axios';

// Create axios instance - use relative path for proxy
const api = axios.create({
  baseURL: '/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods for authentication
export const authApi = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
};

// API service methods for orders
export const ordersApi = {
  getOrders: (params) => api.get('/orders/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  createOrder: (data) => api.post('/orders/', data),
  updateOrder: (id, data) => api.patch(`/orders/${id}/`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}/`),
};

// API service methods for dashboards
export const dashboardApi = {
  // Dashboard endpoints
  getDashboards: () => api.get('/dashboard/'),
  getDashboard: (id) => api.get(`/dashboard/${id}/`),
  createDashboard: (data) => api.post('/dashboard/', data),
  deleteDashboard: (id) => api.delete(`/dashboard/${id}/`),
  
  // Save dashboard layout
  saveDashboardLayout: (data) => api.post('/dashboard/save/', data),
  
  // Get dashboard layout
  getDashboardLayout: (id) => api.get(`/dashboard/${id}/layout/`),
  
  // Widget endpoints
  getWidgets: (dashboardId) => {
    const params = dashboardId ? { dashboard: dashboardId } : {};
    return api.get('/widgets/', { params });
  },
  getWidget: (id) => api.get(`/widgets/${id}/`),
  createWidget: (data) => api.post('/widgets/', data),
  updateWidget: (id, data) => api.patch(`/widgets/${id}/`, data),
  deleteWidget: (id) => api.delete(`/widgets/${id}/`),
};

// Convert frontend date filter to backend format
const convertDateRange = (range) => {
  const rangeMap = {
    'all': 'all',
    'today': 'today',
    'last_7_days': '7d',
    'last_30_days': '30d',
    'last_90_days': '90d',
  };
  return rangeMap[range] || 'all';
};

// API service methods for analytics
export const analyticsApi = {
  // Legacy endpoints for backward compatibility
  getRevenueData: (range = 'all') => {
    const rangeParam = convertDateRange(range);
    return api.get('/analytics/revenue/', { params: { range: rangeParam } });
  },
  
  getOrdersData: (range = 'all') => {
    const rangeParam = convertDateRange(range);
    return api.get('/analytics/orders/', { params: { range: rangeParam } });
  },
  
  getKpiData: (range = 'all') => {
    const rangeParam = convertDateRange(range);
    return api.get('/analytics/kpi/', { params: { 
      metric: 'total_amount', 
      aggregation: 'SUM',
      range: rangeParam 
    }});
  },
  
  // New parameterized endpoints
  
  // KPI: /api/analytics/kpi?metric=X&aggregation=Y&range=Z
  getKpi: (params) => {
    const { metric, aggregation, range } = params;
    const rangeParam = convertDateRange(range);
    return api.get('/analytics/kpi/', { 
      params: { 
        metric: metric || 'total_amount', 
        aggregation: aggregation || 'SUM',
        range: rangeParam
      } 
    });
  },
  
  // Chart: /api/analytics/chart?x=X&y=Y&aggregation=Z&range=R
  getChartData: (params) => {
    const { x, y, aggregation, range } = params;
    const rangeParam = convertDateRange(range);
    return api.get('/analytics/chart/', { 
      params: { 
        x: x || 'product', 
        y: y || 'quantity',
        aggregation: aggregation || 'SUM',
        range: rangeParam
      } 
    });
  },
  
  // Orders Table: /api/analytics/orders?range=R&page=P&page_size=S
  getOrdersTable: (params) => {
    const { range, page, page_size, status, search } = params;
    const rangeParam = convertDateRange(range);
    return api.get('/analytics/orders/', { 
      params: { 
        range: rangeParam,
        page: page || 1,
        page_size: page_size || 20,
        status: status,
        search: search
      } 
    });
  },
};

export default api;
