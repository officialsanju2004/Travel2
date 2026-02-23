import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { getInitials } from '../../utils/helpers'
import {
  RiDashboardLine, RiUserLine, RiFileList3Line, RiBankCardLine,
  RiBarChartLine, RiTeamLine, RiPlaneLine, RiMenuLine,
  RiCloseLine, RiLogoutBoxLine, RiSettings3Line, RiNotification3Line,
  RiArrowRightSLine
} from 'react-icons/ri'

const navItems = (isAdmin) => [
  { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine, group: 'main' },
  { path: '/leads', label: 'Leads', icon: RiFileList3Line, group: 'main' },
  { path: '/billing', label: 'Billing', icon: RiBankCardLine, group: 'main' },
  ...(isAdmin ? [
    { path: '/reports', label: 'Reports', icon: RiBarChartLine, group: 'management' },
    { path: '/users', label: 'Team', icon: RiTeamLine, group: 'management' },
  ] : []),
  { path: '/profile', label: 'Profile', icon: RiSettings3Line, group: 'account' },
]

const SidebarContent = ({ onClose }) => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const items = navItems(isAdmin)
  const groups = { main: 'Navigation', management: 'Management', account: 'Account' }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-ink-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-azure-600 rounded-xl flex items-center justify-center shadow-glow-azure">
              <RiPlaneLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-base leading-none">TravelCRM</div>
              <div className="text-azure-500 text-xs font-display mt-0.5">Enterprise</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="btn-icon lg:hidden">
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-display font-semibold ${isAdmin ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-azure-500/15 text-azure-400 border border-azure-500/20'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {isAdmin ? 'Administrator' : 'Sales Agent'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-none">
        {Object.entries(groups).map(([group, label]) => {
          const groupItems = items.filter(i => i.group === group)
          if (groupItems.length === 0) return null
          return (
            <div key={group} className="mb-4">
              <p className="px-3 py-1.5 text-xs font-display font-semibold text-ink-600 uppercase tracking-widest">{label}</p>
              <div className="space-y-0.5">
                {groupItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <RiArrowRightSLine className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-ink-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-800/60 border border-ink-700/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-azure-600 to-indigo-600 flex items-center justify-center text-white text-sm font-display font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-display font-semibold text-ink-100 truncate">{user?.name}</div>
            <div className="text-xs text-ink-500 truncate">{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="btn-icon p-1.5 hover:text-rose-400 hover:bg-rose-500/10" title="Sign out">
            <RiLogoutBoxLine className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const pageTitle = {
    '/dashboard': 'Dashboard',
    '/leads': 'Leads',
    '/billing': 'Billing',
    '/reports': 'Reports',
    '/users': 'Team',
    '/profile': 'Profile',
  }[location.pathname] || 'TravelCRM'

  return (
    <div className="flex h-screen bg-ink-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-ink-900 border-r border-ink-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-ink-900 border-b border-ink-800 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="btn-icon lg:hidden">
              <RiMenuLine className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-white text-base">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-icon relative">
              <RiNotification3Line className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-azure-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-azure-600 to-indigo-600 flex items-center justify-center text-white text-xs font-display font-bold">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
