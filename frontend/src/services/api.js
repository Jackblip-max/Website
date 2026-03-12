import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API_URL configured as:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Login endpoints — never attach tokens to these
const isLoginEndpoint = (url) =>
  url === '/admin/login' || url === '/auth/login' || url === '/auth/register'

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url)

    // Never attach a token to login/register endpoints
    if (isLoginEndpoint(config.url)) {
      console.log('🔓 Login endpoint — no token attached')
      return config
    }

    const isAdminEndpoint = config.url?.includes('/admin')

    let token
    if (isAdminEndpoint) {
      token = localStorage.getItem('adminToken')
      console.log('🔐 Admin endpoint, using adminToken:', token ? 'present' : 'missing')
    } else {
      token = sessionStorage.getItem('token')
      console.log('👤 Regular endpoint, using token:', token ? 'present' : 'missing')
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const url = error.config?.url
    const isAdminEndpoint = url?.includes('/admin')
    // Never auto-redirect on login/auth endpoints — let the component handle the error
    const isAuthUrl = isLoginEndpoint(url) || url?.includes('/auth/')

    if (error.response?.status === 401 && !isAuthUrl) {
      if (isAdminEndpoint) {
        console.error('❌ Admin session expired - clearing admin tokens')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        window.location.href = '/admin/login'
      } else {
        console.error('❌ User session expired - clearing user tokens')
        sessionStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
