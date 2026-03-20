import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Building2, Users, Heart, Check, XCircle, Mail,
  AlertCircle, Edit, Clock, Award, Trash2, ChevronDown,
  ChevronUp, Save, X, MapPin, Calendar, Tag
} from 'lucide-react'
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

  const [certificateModal, setCertificateModal] = useState({ isOpen: false, applicant: null })
  const [activeTab, setActiveTab] = useState('opportunities')
  const [editingOpp, setEditingOpp] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedOpp, setExpandedOpp] = useState(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated && !user?.organization) {
      toast.error('You need to create an organization first')
      navigate('/create-organization')
    }
  }, [authLoading, isAuthenticated, user, navigate])

  const shouldFetchData = isAuthenticated && !authLoading && !!user?.organization

  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['myOrganization'],
    queryFn: () => organizationService.getMyOrganization(),
    enabled: shouldFetchData, retry: 1
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['orgStats'],
    queryFn: () => organizationService.getOrganizationStats(),
    enabled: shouldFetchData, retry: 1
  })

  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ['orgOpportunities'],
    queryFn: () => organizationService.getOrganizationOpportunities(),
    enabled: shouldFetchData, retry: 1
  })

  const { data: applicants, isLoading: applicantsLoading, error: applicantsError } = useQuery({
    queryKey: ['applicants', opportunities],
    queryFn: async () => {
      const oppsData = opportunities?.data || opportunities || []
      if (!oppsData.length) return []
      const arrays = await Promise.all(
        oppsData.map(async (opp) => {
          try {
            const result = await organizationService.getApplicants(opp.id)
            if (result?.data && Array.isArray(result.data)) return result.data
            if (Array.isArray(result)) return result
            return []
          } catch { return [] }
        })
      )
      return arrays.flat()
    },
    enabled: shouldFetchData && !!opportunities && (opportunities?.data?.length > 0 || opportunities?.length > 0),
    retry: 2
  })

  const updateOppMutation = useMutation({
    mutationFn: ({ id, data }) => organizationService.updateOpportunity(id, data),
    onSuccess: () => {
      toast.success('Updated!')
      setEditingOpp(null); setEditForm({})
      queryClient.invalidateQueries(['orgOpportunities'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update')
  })

  const deleteOppMutation = useMutation({
    mutationFn: (id) => organizationService.deleteOpportunity(id),
    onSuccess: () => {
      toast.success('Deleted')
      setDeleteConfirm(null)
      queryClient.invalidateQueries(['orgOpportunities'])
      queryClient.invalidateQueries(['orgStats'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete')
  })

  const acceptMutation = useMutation({
    mutationFn: (id) => organizationService.acceptApplicant(id),
    onSuccess: () => { toast.success('Accepted! 🎉'); queryClient.invalidateQueries(['applicants']); queryClient.invalidateQueries(['orgStats']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  })

  const declineMutation = useMutation({
    mutationFn: (id) => organizationService.declineApplicant(id),
    onSuccess: () => { toast.success('Declined'); queryClient.invalidateQueries(['applicants']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  })

  const certificateMutation = useMutation({
    mutationFn: (data) => organizationService.generateCertificate(data),
    onSuccess: () => {
      toast.success('Certificate sent!')
      setCertificateModal({ isOpen: false, applicant: null })
      queryClient.invalidateQueries(['applicants'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to generate certificate')
  })

  const startEdit = (opp) => {
    setEditingOpp(opp.id)
    setEditForm({
      title: opp.title || '', description: opp.description || '',
      location: opp.location || '', mode: opp.mode || 'onsite',
      category: opp.category || '', deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
      requirements: opp.requirements || '',
    })
  }

  const oppsData = opportunities?.data || opportunities || []
  const orgData = organization?.data || organization

  const getLogoUrl = (logo) => {
    if (!logo) return null
    if (logo.startsWith('http')) return logo
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    return `${baseUrl}${logo}`
  }
  const logoUrl = getLogoUrl(orgData?.logo)
  const activeOppsData = oppsData.filter(opp => opp.status !== 'expired')

  if (authLoading || statsLoading || oppsLoading || orgLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>
  }

  return (
    <DynamicBackground category="minimal" overlay={0.85}>
      <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

          {/* ── Org Card ── */}
          {orgData && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt={orgData.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0"
                      onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
                      {orgData.name?.charAt(0) || 'O'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{orgData.name}</h2>
                      {orgData.isVerified || orgData.verificationStatus === 'approved' ? (
                        <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"><Check className="w-3 h-3" />Verified</span>
                      ) : orgData.verificationStatus === 'pending' ? (
                        <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"><Clock className="w-3 h-3" />Pending</span>
                      ) : (
                        <span className="flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"><AlertCircle className="w-3 h-3" />Unverified</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm mb-2 leading-relaxed line-clamp-2 sm:line-clamp-3">{orgData.description}</p>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{orgData.contactDetails}</span>
                    </div>
                    {orgData.verificationStatus === 'pending' && (
                      <div className="mt-2 p-2.5 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                        <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                        Pending admin verification. Post opportunities after approval.
                      </div>
                    )}
                  </div>
                </div>
                <Link to="/org/edit" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap">
                  <Edit className="w-4 h-4" />Edit
                </Link>
              </div>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: t('activeJobs'), value: stats?.data?.activeJobs || 0, color: 'text-blue-600', icon: <Building2 className="w-6 h-6 sm:w-10 sm:h-10 text-blue-400 opacity-60" /> },
              { label: t('totalApplicants'), value: stats?.data?.totalApplicants || 0, color: 'text-emerald-600', icon: <Users className="w-6 h-6 sm:w-10 sm:h-10 text-emerald-400 opacity-60" /> },
              { label: t('accepted'), value: stats?.data?.accepted || 0, color: 'text-purple-600', icon: <Heart className="w-6 h-6 sm:w-10 sm:h-10 text-purple-400 opacity-60" /> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="bg-white rounded-xl shadow p-3 sm:p-6 flex items-center justify-between">
                <div>
                  <p className={`${color} text-xs sm:text-sm font-medium leading-tight`}>{label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="hidden sm:block">{icon}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-0 border-b border-gray-100 overflow-x-auto">
              <div className="flex gap-1 flex-shrink-0">
                {[
                  { id: 'opportunities', label: `Opps (${activeOppsData.length})` },
                  { id: 'applicants', label: `Applicants (${applicants?.length || 0})` },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
                    style={{ borderColor: activeTab === tab.id ? '#059669' : 'transparent', color: activeTab === tab.id ? '#059669' : '#6b7280' }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {(orgData?.verificationStatus === 'approved' || orgData?.isVerified) && (
                <Link to="/add-job"
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 text-xs sm:text-sm font-semibold mb-1 transition-colors flex-shrink-0 ml-2">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">{t('addJob')}</span><span className="sm:hidden">Add</span>
                </Link>
              )}
            </div>

            <div className="p-4 sm:p-6">

              {/* Opportunities Tab */}
              {activeTab === 'opportunities' && (
                <div className="space-y-3 sm:space-y-4">
                  {oppsLoading ? (
                    <div className="flex justify-center py-12"><Loader /></div>
                  ) : activeOppsData.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium text-sm sm:text-base">No opportunities posted yet</p>
                      {(orgData?.isVerified || orgData?.verificationStatus === 'approved') && (
                        <Link to="/add-job" className="mt-3 inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                          <Plus className="w-4 h-4" /> Post your first opportunity
                        </Link>
                      )}
                    </div>
                  ) : activeOppsData.map(opp => (
                    <div key={opp.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      {editingOpp !== opp.id ? (
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 leading-snug">{opp.title}</h4>
                              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2">{opp.description}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {opp.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.location}</span>}
                                {opp.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(opp.deadline).toLocaleDateString()}</span>}
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{applicants?.filter(a => a.opportunityTitle === opp.title)?.length || 0} applicants</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <button onClick={() => startEdit(opp)}
                                className="p-1.5 sm:p-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors">
                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              {deleteConfirm === opp.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => deleteOppMutation.mutate(opp.id)} disabled={deleteOppMutation.isPending}
                                    className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                                    {deleteOppMutation.isPending ? '...' : 'Delete'}
                                  </button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(opp.id)}
                                  className="p-1.5 sm:p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              )}
                              <button onClick={() => setExpandedOpp(expandedOpp === opp.id ? null : opp.id)}
                                className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                                {expandedOpp === opp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {expandedOpp === opp.id && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Applicants</p>
                              {applicants?.filter(a => a.opportunityTitle === opp.title)?.length > 0 ? (
                                <div className="space-y-2">
                                  {applicants.filter(a => a.opportunityTitle === opp.title).map(app => (
                                    <div key={app.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                          {app.volunteerName?.charAt(0) || 'V'}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-semibold text-xs text-gray-900 truncate">{app.volunteerName}</p>
                                          <p className="text-xs text-gray-400 truncate">{app.email}</p>
                                        </div>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
                                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {app.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 text-center py-3">No applicants yet</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Edit Mode
                        <div className="p-4 sm:p-5 bg-blue-50/40">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base">Edit opportunity</h4>
                            <button onClick={() => setEditingOpp(null)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-500">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                              <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                              <input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Mode</label>
                              <select value={editForm.mode} onChange={e => setEditForm(p => ({ ...p, mode: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                                <option value="onsite">Onsite</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                              <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                                <option value="">Select category</option>
                                <option value="environment">Environment</option>
                                <option value="education">Education</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="community">Community</option>
                                <option value="animals">Animals</option>
                                <option value="arts">Arts</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Deadline</label>
                              <input type="date" value={editForm.deadline} onChange={e => setEditForm(p => ({ ...p, deadline: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Requirements</label>
                              <textarea value={editForm.requirements} onChange={e => setEditForm(p => ({ ...p, requirements: e.target.value }))}
                                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingOpp(null)}
                              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-200 border border-gray-300">Cancel</button>
                            <button onClick={() => {
                              if (!editForm.title?.trim()) return toast.error('Title is required')
                              updateOppMutation.mutate({ id: opp.id, data: editForm })
                            }} disabled={updateOppMutation.isPending}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                              <Save className="w-3.5 h-3.5" />
                              {updateOppMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Applicants Tab */}
              {activeTab === 'applicants' && (
                <div>
                  {applicantsLoading ? (
                    <div className="flex justify-center py-12"><Loader /></div>
                  ) : applicantsError ? (
                    <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
                      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                      <p className="text-red-600 font-medium text-sm">Failed to load applicants</p>
                    </div>
                  ) : applicants && applicants.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {applicants.map((applicant) => (
                        <div key={applicant.id} className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {applicant.volunteerName?.charAt(0) || 'V'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{applicant.volunteerName}</p>
                                <p className="text-xs text-gray-500 truncate">For: <span className="font-medium text-gray-700">{applicant.opportunityTitle}</span></p>
                                <p className="text-xs text-gray-400 truncate">{applicant.email}</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {applicant.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                                  <button onClick={() => acceptMutation.mutate(applicant.id)} disabled={acceptMutation.isPending}
                                    className="bg-emerald-600 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50 text-xs font-medium">
                                    <Check className="w-3.5 h-3.5" />{t('accept')}
                                  </button>
                                  <button onClick={() => declineMutation.mutate(applicant.id)} disabled={declineMutation.isPending}
                                    className="bg-red-600 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-red-700 flex items-center gap-1 disabled:opacity-50 text-xs font-medium">
                                    <XCircle className="w-3.5 h-3.5" />{t('decline')}
                                  </button>
                                </div>
                              )}
                              {applicant.status === 'accepted' && (
                                <div className="flex flex-col gap-1.5">
                                  <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-lg font-medium text-xs inline-flex items-center gap-1">
                                    <Check className="w-3 h-3" />Accepted
                                  </span>
                                  <button onClick={() => setCertificateModal({ isOpen: true, applicant })}
                                    className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-xs font-medium">
                                    <Award className="w-3.5 h-3.5" />Certificate
                                  </button>
                                </div>
                              )}
                              {applicant.status === 'rejected' && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg font-medium text-xs inline-flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />Rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium text-sm">No applicants yet</p>
                      <p className="text-gray-400 text-xs mt-1">Applications will appear here when volunteers apply.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CertificateModal
        isOpen={certificateModal.isOpen}
        onClose={() => { if (!certificateMutation.isPending) setCertificateModal({ isOpen: false, applicant: null }) }}
        applicant={certificateModal.applicant}
        onSubmit={(formData) => certificateMutation.mutate({ applicationId: certificateModal.applicant.id, ...formData })}
        isLoading={certificateMutation.isPending}
      />
    </DynamicBackground>
  )
}

export default OrgDashboard
