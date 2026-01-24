import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Calendar, Clock, Trash2, AlertCircle, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { volunteerService } from '../services/volunteerService'
import Loader from '../components/common/Loader'

const Applications = () => {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch applications
  const { data: applicationsData, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      console.log('📋 Fetching applications...')
      const result = await volunteerService.getMyApplications()
      console.log('📦 Applications response:', result)
      return result
    },
    enabled: isAuthenticated && user?.role === 'volunteer'
  })

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: (applicationId) => volunteerService.withdrawApplication(applicationId),
    onSuccess: () => {
      toast.success('Application withdrawn successfully')
      queryClient.invalidateQueries(['applications'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to withdraw application')
    }
  })

  const handleDelete = (applicationId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      deleteMutation.mutate(applicationId)
    }
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your applications</p>
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader />
              <p className="text-gray-600 mt-4">Loading your applications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    console.error('❌ Applications error:', error)
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Applications</h3>
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

  // Extract applications from response
  const applications = applicationsData?.data || applicationsData || []

  console.log('📋 Applications to display:', applications)
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'accepted': return '✅'
      case 'rejected': return '❌'
      default: return '•'
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-900">{t('applications')}</h1>
          </div>
          <p className="text-gray-600 text-lg">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'} submitted
          </p>
        </div>

        {/* Applications List */}
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => {
              // Handle different response structures
              const opportunity = app.opportunity || {}
              const organization = opportunity.organization || {}
              
              return (
                <div key={app.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Opportunity Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {opportunity.title || 'Unknown Opportunity'}
                      </h3>
                      
                      {/* Organization */}
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building2 className="w-4 h-4" />
                        <p className="font-medium">
                          {organization.name || 'Unknown Organization'}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-3">
                        {opportunity.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{opportunity.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Applied: {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {opportunity.timeCommitment && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{opportunity.timeCommitment}</span>
                          </div>
                        )}
                      </div>

                      {/* Opportunity Description Preview */}
                      {opportunity.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {opportunity.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Status & Actions */}
                    <div className="ml-4 flex flex-col items-end gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(app.status)} flex items-center gap-2`}>
                        <span>{getStatusIcon(app.status)}</span>
                        <span className="capitalize">{t(app.status)}</span>
                      </span>
                      
                      {app.status === 'pending' && (
                        <button
                          onClick={(e) => handleDelete(app.id, e)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Withdraw application"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Additional Info for Accepted */}
                  {app.status === 'accepted' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">
                        🎉 <strong>Congratulations!</strong> Your application has been accepted. 
                        The organization will contact you soon with next steps.
                      </p>
                    </div>
                  )}

                  {/* Additional Info for Rejected */}
                  {app.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">
                        Unfortunately, your application was not selected for this opportunity. 
                        Keep looking for other great opportunities!
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Clock className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Applications Yet</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You haven't applied to any volunteer opportunities yet. 
                Browse opportunities and start making a difference!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-lg"
              >
                Browse Opportunities
              </button>
            </div>
          </div>
        )}

        {/* Helpful Tip */}
        {applications.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">💡 Application Status Guide</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>⏳ Pending:</strong> Your application is being reviewed</li>
                  <li><strong>✅ Accepted:</strong> Congratulations! You've been selected</li>
                  <li><strong>❌ Rejected:</strong> Not selected this time, keep applying!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications
