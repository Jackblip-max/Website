import api from './api'

export const organizationService = {
  createOrganization: async (orgData) => {
    return await api.post('/organizations', orgData)
  },

  getMyOrganization: async () => {
    return await api.get('/organizations/my')
  },

  updateOrganization: async (id, orgData) => {
    return await api.put(`/organizations/${id}`, orgData)
  },

  uploadLogo: async (file) => {
    const formData = new FormData()
    formData.append('logo', file)
    return await api.post('/organizations/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  createOpportunity: async (opportunityData) => {
    return await api.post('/opportunities', opportunityData)
  },

  updateOpportunity: async (id, opportunityData) => {
    return await api.put(`/opportunities/${id}`, opportunityData)
  },

  deleteOpportunity: async (id) => {
    return await api.delete(`/opportunities/${id}`)
  },

  getOrganizationOpportunities: async () => {
    return await api.get('/organizations/opportunities')
  },

  getApplicants: async (opportunityId) => {
    return await api.get(`/opportunities/${opportunityId}/applicants`)
  },

  acceptApplicant: async (applicationId) => {
    return await api.put(`/applications/${applicationId}/accept`)
  },

  declineApplicant: async (applicationId) => {
    return await api.put(`/applications/${applicationId}/decline`)
  },

  getOrganizationStats: async () => {
    return await api.get('/organizations/stats')
  }
}