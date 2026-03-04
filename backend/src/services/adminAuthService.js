import api from './api'

const ADMIN_TOKEN_KEY = 'adminToken'
const ADMIN_USER_KEY = 'adminUser'

export const adminAuthService = {
  // Admin login
  login: async (email, password) => {
    console.log('📧 Admin login attempt:', email)
    const response = await api.post('/admin/login', { email, password })
    
    if (response.data.success) {
      // Store token and user
      localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token)
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.data.user))
      console.log('✅ Admin login successful')
    }
    
    return response.data
  },

  // Get current admin
  getCurrentAdmin: () => {
    const userStr = localStorage.getItem(ADMIN_USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  // Get admin token
  getToken: () => {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  },

  // Check if logged in as admin
  isAuthenticated: () => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    const user = adminAuthService.getCurrentAdmin()
    return !!(token && user && user.role === 'admin')
  },

  // Logout
  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
    console.log('👋 Admin logged out')
  }
}
