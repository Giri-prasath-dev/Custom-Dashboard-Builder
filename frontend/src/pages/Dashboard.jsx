import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import DashboardCanvas from '../components/DashboardCanvas';
import Orders from './Orders';
import Toast from '../components/Toast';

// Date filter options per specification
const DATE_FILTERS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
];

const Dashboard = ({ viewMode = 'orders' }) => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Date filter state
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    if (viewMode === 'dashboard') {
      fetchDashboards();
    } else {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    if (selectedDashboard) {
      fetchWidgets(selectedDashboard);
    } else {
      setWidgets([]);
    }
  }, [selectedDashboard]);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getDashboards();
      const dashboardData = response.data.results || response.data;
      setDashboards(dashboardData);
      
      if (dashboardData.length > 0 && !selectedDashboard) {
        setSelectedDashboard(dashboardData[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboards:', err);
      showToast('Failed to load dashboards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWidgets = async (dashboardId) => {
    try {
      const response = await dashboardApi.getWidgets(dashboardId);
      setWidgets(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching widgets:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  };

  const handleWidgetsChange = (updatedWidgets) => {
    setWidgets(updatedWidgets);
  };

  const handleError = (errorMessage) => {
    showToast(errorMessage, 'error');
  };

  // Show Orders view
  if (viewMode === 'orders') {
    return <Orders />;
  }

  // Dashboard view
  if (loading && dashboards.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#54bd95] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const hasWidgets = widgets.length > 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">View your configured dashboard widgets</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Filter */}
          {hasWidgets && (
            <div className="flex items-center gap-2">
              <label htmlFor="dateFilter" className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Show data for
              </label>
              <select
                id="dateFilter"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54bd95]/30 focus:border-[#54bd95] text-sm bg-white"
              >
                {DATE_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => navigate('/configure')}
            className="bg-[#54bd95] text-white py-2 px-4 rounded-lg hover:bg-[#48a883] transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configure Dashboard
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!hasWidgets ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Not Configured</h2>
            <p className="text-sm text-gray-500 mb-6">
              Configure your dashboard to start viewing analytics
            </p>
            <button
              onClick={() => navigate('/configure')}
              className="bg-[#54bd95] text-white py-2.5 px-6 rounded-lg hover:bg-[#48a883] transition-colors inline-flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configure Dashboard
            </button>
          </div>
        </div>
      ) : (
        <DashboardCanvas
          widgets={widgets}
          dashboardId={selectedDashboard}
          onWidgetsChange={handleWidgetsChange}
          onError={handleError}
          dateRange={dateRange}
        />
      )}
    </div>
  );
};

export default Dashboard;
