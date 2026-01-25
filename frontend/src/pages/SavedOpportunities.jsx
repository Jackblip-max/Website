import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Trash2, AlertCircle, ExternalLink, MapPin, Calendar, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { volunteerService } from '../services/volunteerService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SavedOpportunities = () => {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch saved opportunities
  const { data: savedData, isLoading, error } = useQuery({
    queryKey: ['savedOpportunities'],
    queryFn: async () => {
      console.log('📚 Fetching saved opportunities...')
      const result = await volunteerService.getSavedOpportunities()
      console.log('📚 Raw saved data:', result)
      return result
    },
    enabled: isAuthenticated && user?.role === 'volunteer'
  })

  // Unsave mutation
  const unsaveMutation = useMutation({
    mutationFn: (opportunityId) => {
      console.log('🗑️ UNSAVE MUTATION - Opportunity ID:', opportunityId)
      console.log('🗑️ User ID:', user?.id)
      console.log('🗑️ Volunteer ID:', user?.volunteer?.id)
      return volunteerService.unsaveOpportunity(opportunityId)
    },
    onSuccess: () => {
      toast.success('Removed from saved opportunities')
      queryClient.invalidateQueries(['savedOpportunities'])
      queryClient.invalidateQueries(['savedStatus'])
    },
    onError: (error) => {
      console.error('🗑️ UNSAVE ERROR:', error)
      console.error('🗑️ Error response:', error.response)
      toast.error(error.response?.data?.message || 'Failed to remove opportunity')
    }
  })

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: (opportunityId) => volunteerService.applyToOpportunity(opportunityId),
    onSuccess: () => {
      toast.success('Application submitted successfully! 🎉')
      queryClient.invalidateQueries(['applications'])
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to submit application'
      toast.error(message)
    }
  })

  const handleUnsave = (opportunity, e) => {
    e.stopPropagation()
    
    console.log('🗑️ HANDLE UNSAVE CALLED')
    console.log('🗑️ Full opportunity object:', opportunity)
    console.log('🗑️ Opportunity ID:', opportunity.id)
    console.log('🗑️ Opportunity Title:', opportunity.title)
    
    if (window.confirm(`Remove "${opportunity.title}" from saved items?`)) {
      unsaveMutation.mutate(opportunity.id)
    }
  }

  const handleApply = (opportunityId, e) => {
    e.stopPropagation()
    applyMutation.mutate(opportunityId)
  }

  const getModeColor = (mode) => {
    switch(mode) {
      case 'onsite': return 'bg-blue-100 text-blue-800'
      case 'remote': return 'bg-purple-100 text-purple-800'
      case 'hybrid': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your saved opportunities</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Check if user is volunteer
  if (user?.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Volunteers Only</h2>
          <p className="text-gray-600 mb-6">This feature is only available for volunteers</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading saved opportunities...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Saved Opportunities</h3>
            <p className="text-red-700 mb-4">{error.message || 'An error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Extract opportunities from response
  const savedOpportunities = savedData?.data || savedData || []
  
  console.log('📊 SAVED OPPORTUNITIES ARRAY:', savedOpportunities)
  console.log('📊 Count:', savedOpportunities.length)
  if (savedOpportunities.length > 0) {
    console.log('📊 First item structure:', savedOpportunities[0])
    console.log('📊 All IDs:', savedOpportunities.map(o => ({ id: o.id, title: o.title })))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-900">{t('savedTasks')}</h1>
          </div>
          <p className="text-gray-600 text-lg">
            {savedOpportunities.length} saved {savedOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
        </div>

        {/* Opportunities Grid */}
        {savedOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOpportunities.map((opportunity) => {
              console.log('🔍 Rendering card for opportunity:', {
                id: opportunity.id,
                title: opportunity.title,
                isSaved: opportunity.isSaved
              })
              
              return (
                <div
                  key={opportunity.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className="p-6">           
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          {opportunity.title}
                        </h3>
                        <p className="text-emerald-600 font-medium mb-1">
                          {opportunity.organizationName || opportunity.organization?.name}
                        </p>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{opportunity.location}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getModeColor(opportunity.mode)}`}>
                        {t(opportunity.mode)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {opportunity.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{opportunity.timeCommitment}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => handleApply(opportunity.id, e)}
                        disabled={applyMutation.isPending}
                        className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyMutation.isPending ? 'Applying...' : t('apply')}
                      </button>
                      <button
                        onClick={(e) => handleUnsave(opportunity, e)}
                        disabled={unsaveMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Bookmark className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Saved Opportunities</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You haven't saved any volunteer opportunities yet. 
                Browse opportunities and click the bookmark icon to save them for later!
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Browse Opportunities
              </button>
            </div>
          </div>
        )}

        {/* Helpful Tip */}
        {savedOpportunities.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">💡 Quick Tip</h3>
                <p className="text-sm text-blue-800">
                  Save opportunities that interest you and apply when you're ready. 
                  We'll also send you deadline reminders via email if you've enabled notifications!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedOpportunities
