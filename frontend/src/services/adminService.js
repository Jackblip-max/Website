import api from './api'

export const adminService = {
  // Dashboard stats
  getStats: async () => {
    return await api.get('/admin/stats')
  },

  // Organization management
  getPendingOrganizations: async () => {
    return await api.get('/admin/organizations/pending')
  },

  getAllOrganizations: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    return await api.get(`/admin/organizations?${params}`)
  },

  approveOrganization: async ({ id, message }) => {
    return await api.put(`/admin/organizations/${id}/approve`, { message })
  },

  rejectOrganization: async ({ id, reason }) => {
    return await api.put(`/admin/organizations/${id}/reject`, { reason })
  },

  // User management
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    return await api.get(`/admin/users?${params}`)
  },

  deleteUser: async (id, reason) => {
    return await api.delete(`/admin/users/${id}`, { 
      data: { reason } 
    })
  },

  // Activity logs
  getAdminLogs: async (page = 1, limit = 50) => {
    return await api.get(`/admin/logs?page=${page}&limit=${limit}`)
  }
}
