import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API_URL configured as:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url)
    
    // Check if this is an admin endpoint
    const isAdminEndpoint = config.url?.includes('/admin')
    
    let token
    if (isAdminEndpoint) {
      token = localStorage.getItem('adminToken')
      console.log('🔐 Admin endpoint detected, using adminToken:', token ? 'present' : 'missing')
    } else {
      // Use sessionStorage for regular user token
      token = sessionStorage.getItem('token')
      console.log('👤 Regular endpoint, using token:', token ? 'present' : 'missing')
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const isAdminEndpoint = error.config?.url?.includes('/admin')
    // Auth endpoints returning 401 mean wrong credentials — not an expired session.
    // Never redirect on these; let the component's onError handler show the message.
    const isAuthEndpoint = error.config?.url?.includes('/auth/')

    if (error.response?.status === 401 && !isAuthEndpoint) {
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
