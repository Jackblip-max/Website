import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, Users, Heart, User, Check, XCircle, Mail, Phone, AlertCircle, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '../context/LanguageContext'
import { organizationService } from '../services/organizationService'
import Loader from '../components/common/Loader'

const OrgDashboard = () => {
  const { t } = useLanguage()
  const queryClient = useQueryClient()

  // Fetch organization details
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['myOrganization'],
    queryFn: organizationService.getMyOrganization
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['orgStats'],
    queryFn: organizationService.getOrganizationStats
  })

  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ['orgOpportunities'],
    queryFn: organizationService.getOrganizationOpportunities
  })

  const { data: applicants, isLoading: applicantsLoading } = useQuery({
    queryKey: ['applicants'],
    queryFn: async () => {
      if (!opportunities?.length) return []
      const allApplicants = await Promise.all(
        opportunities.map(opp => organizationService.getApplicants(opp.id))
      )
      return allApplicants.flat()
    },
    enabled: !!opportunities?.length
  })

  const acceptMutation = useMutation({
    mutationFn: (applicationId) => organizationService.acceptApplicant(applicationId),
    onSuccess: () => {
      toast.success('Applicant accepted!')
      queryClient.invalidateQueries(['applicants'])
      queryClient.invalidateQueries(['orgStats'])
    }
  })

  const declineMutation = useMutation({
    mutationFn: (applicationId) => organizationService.declineApplicant(applicationId),
    onSuccess: () => {
      toast.success('Applicant declined')
      queryClient.invalidateQueries(['applicants'])
    }
  })

  if (statsLoading || oppsLoading || orgLoading) return <Loader />

  // Extract organization data
  const orgData = organization?.data || organization

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Organization Details Card */}
        {orgData && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                {/* Logo */}
                {orgData.logo ? (
                  <img 
                    src={orgData.logo} 
                    alt={orgData.name}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    {orgData.name?.charAt(0) || 'O'}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-gray-900">{orgData.name}</h2>
                    {orgData.isVerified ? (
                      <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{orgData.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{orgData.contactDetails}</span>
                    </div>
                  </div>

                  {!orgData.isVerified && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Your organization is pending verification. Some features may be limited until verification is complete.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/org/edit"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </Link>
            </div>

            {/* Member Since */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Member Since:</span>{' '}
                {orgData.createdAt ? new Date(orgData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <Link
              to="/add-job"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-medium flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{t('addJob')}</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">{t('activeJobs')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.activeJobs || 0}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">{t('totalApplicants')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalApplicants || 0}</p>
                </div>
                <Users className="w-12 h-12 text-emerald-600 opacity-50" />
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">{t('accepted')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.accepted || 0}</p>
                </div>
                <Heart className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Applicants List */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('applicants')}</h3>
          {applicantsLoading ? (
            <Loader />
          ) : applicants && applicants.length > 0 ? (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div key={applicant.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{applicant.volunteerName}</p>
                      <p className="text-sm text-gray-600">Applied for: {applicant.opportunityTitle}</p>
                      <p className="text-xs text-gray-500">{applicant.email} • {applicant.phone}</p>
                    </div>
                  </div>
                  {applicant.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptMutation.mutate(applicant.id)}
                        disabled={acceptMutation.isPending}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('accept')}</span>
                      </button>
                      <button
                        onClick={() => declineMutation.mutate(applicant.id)}
                        disabled={declineMutation.isPending}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{t('decline')}</span>
                      </button>
                    </div>
                  )}
                  {applicant.status === 'accepted' && (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                      {t('accepted')}
                    </span>
                  )}
                  {applicant.status === 'rejected' && (
                    <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium">
                      {t('rejected')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No applicants yet</p>
              <p className="text-gray-500 text-sm mt-2">Post some volunteer opportunities to start receiving applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrgDashboard
