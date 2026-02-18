import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, Users, Heart, User, Check, XCircle, Mail, AlertCircle, Edit, Clock, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { organizationService } from '../services/organizationService'
import Loader from '../components/common/Loader'
import CertificateModal from '../components/certificates/CertificateModal'
import DynamicBackground from '../components/common/DynamicBackground'

const OrgDashboard = () => {
  const { t } = useLanguage()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // ⭐ Modal state
  const [certificateModal, setCertificateModal] = useState({
    isOpen: false,
    applicant: null
  })

  // ⭐ Check if user should be on this page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // If user doesn't have an organization, redirect to create one
      if (!user?.organization) {
        toast.error('You need to create an organization first')
        navigate('/create-organization')
      }
    }
  }, [authLoading, isAuthenticated, user, navigate])

  // ⭐ Only enable queries if user is authenticated and has organization
  const shouldFetchData = isAuthenticated && !authLoading && !!user?.organization

  // Fetch organization details
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['myOrganization'],
    queryFn: async () => {
      console.log('📊 Fetching organization details...')
      const result = await organizationService.getMyOrganization()
      console.log('✅ Organization data:', result)
      return result
    },
    enabled: shouldFetchData, // ⭐ Only fetch when safe
    retry: 1
  })

  // Fetch organization stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['orgStats'],
    queryFn: async () => {
      console.log('📊 Fetching organization stats...')
      const result = await organizationService.getOrganizationStats()
      console.log('✅ Stats data:', result)
      return result
    },
    enabled: shouldFetchData, // ⭐ Only fetch when safe
    retry: 1
  })

  // Fetch organization opportunities
  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ['orgOpportunities'],
    queryFn: async () => {
      console.log('📊 Fetching organization opportunities...')
      const result = await organizationService.getOrganizationOpportunities()
      console.log('✅ Opportunities data:', result)
      return result
    },
    enabled: shouldFetchData, // ⭐ Only fetch when safe
    retry: 1
  })

  // Fetch applicants for all opportunities
  const { data: applicants, isLoading: applicantsLoading, error: applicantsError } = useQuery({
    queryKey: ['applicants', opportunities],
    queryFn: async () => {
      const oppsData = opportunities?.data || opportunities || []
      
      console.log('📊 Processing opportunities for applicants...')
      console.log('📊 Opportunities count:', oppsData.length)
      
      if (!oppsData.length) {
        console.log('⚠️ No opportunities found, skipping applicants fetch')
        return []
      }
      
      console.log('📊 Fetching applicants for opportunities:', oppsData.map(o => ({ id: o.id, title: o.title })))
      
      try {
        const allApplicantsPromises = oppsData.map(async (opp) => {
          try {
            console.log('🔍 Fetching applicants for opportunity:', opp.id, '-', opp.title)
            const result = await organizationService.getApplicants(opp.id)
            console.log('📦 Raw applicants response for', opp.title, ':', result)
            
            let applicantsData = []
            
            if (result?.data && Array.isArray(result.data)) {
              applicantsData = result.data
              console.log('✓ Extracted from result.data, count:', applicantsData.length)
            } else if (Array.isArray(result)) {
              applicantsData = result
              console.log('✓ Using result directly, count:', applicantsData.length)
            } else {
              console.warn('⚠️ Unexpected response structure for opportunity', opp.id, ':', result)
            }
            
            return applicantsData
          } catch (error) {
            console.error('❌ Error fetching applicants for opportunity', opp.id, ':', error)
            return []
          }
        })
        
        const allApplicantsArrays = await Promise.all(allApplicantsPromises)
        const flatApplicants = allApplicantsArrays.flat()
        
        console.log('✅ Total applicants fetched:', flatApplicants.length)
        console.log('📋 Applicants list:', flatApplicants)
        
        return flatApplicants
      } catch (error) {
        console.error('❌ Error in applicants fetch:', error)
        return []
      }
    },
    enabled: shouldFetchData && !!opportunities && (opportunities?.data?.length > 0 || opportunities?.length > 0), // ⭐ Only fetch when safe
    retry: 2
  })

  // Accept application mutation
  const acceptMutation = useMutation({
    mutationFn: async (applicationId) => {
      console.log('✅ Accepting application:', applicationId)
      return await organizationService.acceptApplicant(applicationId)
    },
    onSuccess: () => {
      toast.success('Applicant accepted! 🎉')
      queryClient.invalidateQueries(['applicants'])
      queryClient.invalidateQueries(['orgStats'])
    },
    onError: (error) => {
      console.error('❌ Accept error:', error)
      toast.error(error.response?.data?.message || 'Failed to accept applicant')
    }
  })

  // Decline application mutation
  const declineMutation = useMutation({
    mutationFn: async (applicationId) => {
      console.log('❌ Declining application:', applicationId)
      return await organizationService.declineApplicant(applicationId)
    },
    onSuccess: () => {
      toast.success('Applicant declined')
      queryClient.invalidateQueries(['applicants'])
    },
    onError: (error) => {
      console.error('❌ Decline error:', error)
      toast.error(error.response?.data?.message || 'Failed to decline applicant')
    }
  })

  // ⭐ Certificate generation mutation
  const certificateMutation = useMutation({
    mutationFn: async (data) => {
      return await organizationService.generateCertificate(data)
    },
    onSuccess: () => {
      toast.success('✅ Certificate generated and sent to volunteer!')
      setCertificateModal({ isOpen: false, applicant: null })
      queryClient.invalidateQueries(['applicants'])
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to generate certificate'
      toast.error(message)
    }
  })

  // ⭐ Open certificate modal
  const handleOpenCertificateModal = (applicant) => {
    setCertificateModal({
      isOpen: true,
      applicant
    })
  }

  // ⭐ Close certificate modal
  const handleCloseCertificateModal = () => {
    if (!certificateMutation.isPending) {
      setCertificateModal({
        isOpen: false,
        applicant: null
      })
    }
  }

  // ⭐ Submit certificate form
  const handleSubmitCertificate = (formData) => {
    certificateMutation.mutate({
      applicationId: certificateModal.applicant.id,
      ...formData
    })
  }

  // Show loading state while checking auth or loading data
  if (authLoading || statsLoading || oppsLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  // Extract organization data from response
  const orgData = organization?.data || organization

  // Get full logo URL
  const getLogoUrl = (logo) => {
    if (!logo) return null
    if (logo.startsWith('http')) return logo
    
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    return `${baseUrl}${logo}`
  }

  const logoUrl = getLogoUrl(orgData?.logo)

  return (
    <DynamicBackground category="minimal" overlay={0.85}>
      <div className="min-h-screen py-12 px-4">
        {/* Organization Details Card */}
        {orgData && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4 flex-1">
                {/* Logo */}
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={orgData.name}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                    onError={(e) => {
                      console.error('Logo failed to load:', logoUrl)
                      e.target.onerror = null
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                {/* Fallback Logo */}
                <div 
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                  style={{ display: logoUrl ? 'none' : 'flex' }}
                >
                  {orgData.name?.charAt(0) || 'O'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-gray-900">{orgData.name}</h2>
                    {orgData.isVerified || orgData.verificationStatus === 'approved' ? (
                      <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Verified
                      </span>
                    ) : orgData.verificationStatus === 'pending' ? (
                      <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Pending Verification
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Not Verified
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

                  {orgData.verificationStatus === 'pending' && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Your organization is pending admin verification. You cannot post opportunities until approved.
                      </p>
                    </div>
                  )}
                  
                  {orgData.verificationStatus === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Your organization verification was rejected. Please contact support or update your information.
                      </p>
                      {orgData.verificationReason && (
                        <p className="text-sm text-red-700 mt-2">
                          <strong>Reason:</strong> {orgData.verificationReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/org/edit"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap ml-4"
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
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-medium flex items-center space-x-2 transition-colors"
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
                  <p className="text-3xl font-bold text-gray-900">{stats?.data?.activeJobs || 0}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">{t('totalApplicants')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.data?.totalApplicants || 0}</p>
                </div>
                <Users className="w-12 h-12 text-emerald-600 opacity-50" />
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">{t('accepted')}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.data?.accepted || 0}</p>
                </div>
                <Heart className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Applicants List */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('applicants')}</h3>
            
            {applicantsLoading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : applicantsError ? (
              <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 text-lg font-medium">Failed to load applicants</p>
                <p className="text-red-500 text-sm mt-2">{applicantsError.message}</p>
              </div>
            ) : applicants && applicants.length > 0 ? (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                          {applicant.volunteerName?.charAt(0) || 'V'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{applicant.volunteerName}</p>
                          <p className="text-sm text-gray-600 font-medium">Applied for: {applicant.opportunityTitle}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {applicant.email}
                            </p>
                            {applicant.phone && (
                              <p className="text-xs text-gray-500">{applicant.phone}</p>
                            )}
                          </div>
                          {applicant.skills && (
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Skills:</strong> {applicant.skills}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {applicant.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => acceptMutation.mutate(applicant.id)}
                              disabled={acceptMutation.isPending}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-1 disabled:opacity-50 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              <span>{t('accept')}</span>
                            </button>
                            <button
                              onClick={() => declineMutation.mutate(applicant.id)}
                              disabled={declineMutation.isPending}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-1 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{t('decline')}</span>
                            </button>
                          </div>
                        )}
                        {applicant.status === 'accepted' && (
                          <div className="flex flex-col gap-2">
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium inline-flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              {t('accepted')}
                            </span>
                            {/* ⭐ Issue Certificate Button */}
                            <button
                              onClick={() => handleOpenCertificateModal(applicant)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-1 transition-colors text-sm font-medium"
                            >
                              <Award className="w-4 h-4" />
                              <span>Issue Certificate</span>
                            </button>
                          </div>
                        )}
                        {applicant.status === 'rejected' && (
                          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium inline-flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            {t('rejected')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No applicants yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  {(opportunities?.data?.length || opportunities?.length || 0) > 0 
                    ? 'Your opportunities are live! Applications will appear here when volunteers apply.'
                    : 'Post some volunteer opportunities to start receiving applications'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ⭐ Certificate Modal */}
      <CertificateModal
        isOpen={certificateModal.isOpen}
        onClose={handleCloseCertificateModal}
        applicant={certificateModal.applicant}
        onSubmit={handleSubmitCertificate}
        isLoading={certificateMutation.isPending}
      />
    </DynamicBackground>
  )
}

export default OrgDashboard
