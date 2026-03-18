import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Dashboard from './pages/Dashboard';
import ConfigureDashboard from './pages/ConfigureDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Auth Context
export const AuthContext = createContext(null);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#54bd95] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Content with Navigation
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const authValue = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    logout: handleLogout,
  };

  // Navigation items matching wireframe
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )},
    { to: '/dashboard/order', label: 'Customer Orders', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
  ];

  const isNavActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/dashboard/view' || location.pathname === '/configure';
    if (to === '/dashboard/order') return location.pathname === '/dashboard/order' || location.pathname === '/orders';
    return location.pathname === to;
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation - Only show when authenticated */}
        {user && (
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-14">
                <div className="flex items-center">
                  {/* Logo / Brand */}
                  <div className="flex-shrink-0 flex items-center mr-8">
                    <div className="w-8 h-8 bg-[#54bd95] rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Dashboard Builder</span>
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden md:flex md:items-center md:gap-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={() =>
                          `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                            isNavActive(item.to)
                              ? 'bg-[#ecfdf5] text-[#54bd95]'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`
                        }
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#54bd95]">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center md:hidden">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
                    aria-expanded={mobileMenuOpen}
                  >
                    {mobileMenuOpen ? (
                      <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 animate-fade-in">
                <div className="px-3 pt-2 pb-3 space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={() =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isNavActive(item.to)
                            ? 'bg-[#ecfdf5] text-[#54bd95]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
                <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#54bd95]">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user?.username}</span>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="text-sm text-gray-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </nav>
        )}

        {/* Main Content */}
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard viewMode="dashboard" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/order"
              element={
                <ProtectedRoute>
                  <Dashboard viewMode="orders" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Dashboard viewMode="orders" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/view"
              element={
                <ProtectedRoute>
                  <Dashboard viewMode="dashboard" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/table"
              element={
                <ProtectedRoute>
                  <Dashboard viewMode="orders" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configure"
              element={
                <ProtectedRoute>
                  <ConfigureDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
