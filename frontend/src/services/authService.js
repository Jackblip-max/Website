import api from './api'

export const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData)
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials)
  },

  googleAuth: async (token) => {
    return await api.post('/auth/google', { token })
  },

  phoneAuth: async (phoneData) => {
    return await api.post('/auth/phone', phoneData)
  },

  verifyPhone: async (code) => {
    return await api.post('/auth/verify-phone', { code })
  },

  getProfile: async () => {
    return await api.get('/auth/profile')
  },

  updateProfile: async (userData) => {
    return await api.put('/auth/profile', userData)
  },

  completeProfile: async (userData) => {
    return await api.post('/auth/complete-profile', userData)
  },

  logout: () => {
    localStorage.removeItem('token')
  }
}
