import { Navigate } from 'react-router-dom'
import { adminAuthService } from '../services/adminAuthService'

const AdminRoute = ({ children }) => {
  const isAuthenticated = adminAuthService.isAuthenticated()
  const currentAdmin = adminAuthService.getCurrentAdmin()

  console.log('🔐 AdminRoute Check:', {
    isAuthenticated,
    admin: currentAdmin,
    role: currentAdmin?.role
  })

  if (!isAuthenticated || currentAdmin?.role !== 'admin') {
    console.log('❌ Not authenticated as admin, redirecting to /admin/login')
    return <Navigate to="/admin/login" replace />
  }

  console.log('✅ Admin authenticated, rendering admin page')
  return children
}

export default AdminRoute
