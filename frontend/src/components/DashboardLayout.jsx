import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';

export default function DashboardLayout({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    student: [
      { path: '/student/dashboard', label: 'My Portfolio' },
      { path: '/student/upload', label: 'Upload Certificate' },
    ],
    faculty: [
      { path: '/faculty/dashboard', label: 'Dashboard' },
    ],
    admin: [
      { path: '/admin', label: 'System Analytics' },
      { path: '/admin/management', label: 'User Management' },
    ]
  };

  const links = menuItems[role] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
             <span className="text-white font-bold tracking-tighter">SH</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Student Hub</h1>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{role}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{role} Portal</h2>
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px]">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700 uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                  {role[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
