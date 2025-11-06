import api from './api'

export const volunteerService = {
  getOpportunities: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    return await api.get(`/opportunities?${params}`)
  },

  getOpportunityById: async (id) => {
    return await api.get(`/opportunities/${id}`)
  },

  searchOpportunities: async (query) => {
    return await api.get(`/opportunities/search?q=${query}`)
  },

  applyToOpportunity: async (opportunityId) => {
    return await api.post(`/applications`, { opportunityId })
  },

  saveOpportunity: async (opportunityId) => {
    return await api.post(`/saved`, { opportunityId })
  },

  unsaveOpportunity: async (opportunityId) => {
    return await api.delete(`/saved/${opportunityId}`)
  },

  getSavedOpportunities: async () => {
    return await api.get('/saved')
  },

  getMyApplications: async () => {
    return await api.get('/applications')
  },

  withdrawApplication: async (applicationId) => {
    return await api.delete(`/applications/${applicationId}`)
  }
}