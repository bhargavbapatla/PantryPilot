import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center justify-center border-b border-slate-700 px-4">
          <h1 className="text-xl font-bold truncate">Inventory App</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            to="/dashboard"
            className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard/inventory"
            className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            Inventory
          </Link>
          <Link
            to="/dashboard/orders"
            className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            Orders
          </Link>
          <Link
            to="/dashboard/reports"
            className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 flex-shrink-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-gray-700 font-medium hidden md:block">
                {user?.name || 'User'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
