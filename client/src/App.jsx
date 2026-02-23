import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/shared/Layout'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import SalesDashboard from './pages/SalesDashboard'
import LeadsPage from './pages/LeadsPage'
import LeadDetailPage from './pages/LeadDetailPage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'
import BillingPage from './pages/BillingPage'
import ReportsPage from './pages/ReportsPage'

const Spinner = () => (
  <div className="h-screen bg-ink-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-ink-500 text-sm font-display">Loading...</span>
    </div>
  </div>
)

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <SalesDashboard />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="reports" element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
