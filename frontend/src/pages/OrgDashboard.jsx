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
  const [activeTab, setActiveTab] = useState('opportunities') // 'opportunities' | 'applicants'
  const [editingOpp, setEditingOpp] = useState(null) // opportunity being edited
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null) // id of opp awaiting confirm
  const [expandedOpp, setExpandedOpp] = useState(null) // id of expanded applicants

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (!user?.organization) {
        toast.error('You need to create an organization first')
        navigate('/create-organization')
      }
    }
  }, [authLoading, isAuthenticated, user, navigate])

  const shouldFetchData = isAuthenticated && !authLoading && !!user?.organization

  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['myOrganization'],
    queryFn: () => organizationService.getMyOrganization(),
    enabled: shouldFetchData,
    retry: 1
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['orgStats'],
    queryFn: () => organizationService.getOrganizationStats(),
    enabled: shouldFetchData,
    retry: 1
  })

  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ['orgOpportunities'],
    queryFn: () => organizationService.getOrganizationOpportunities(),
    enabled: shouldFetchData,
    retry: 1
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

  // ── Mutations ────────────────────────────────────────────────────

  const updateOppMutation = useMutation({
    mutationFn: ({ id, data }) => organizationService.updateOpportunity(id, data),
    onSuccess: () => {
      toast.success('Opportunity updated!')
      setEditingOpp(null)
      setEditForm({})
      queryClient.invalidateQueries(['orgOpportunities'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update opportunity')
  })

  const deleteOppMutation = useMutation({
    mutationFn: (id) => organizationService.deleteOpportunity(id),
    onSuccess: () => {
      toast.success('Opportunity deleted')
      setDeleteConfirm(null)
      queryClient.invalidateQueries(['orgOpportunities'])
      queryClient.invalidateQueries(['orgStats'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete opportunity')
  })

  const acceptMutation = useMutation({
    mutationFn: (applicationId) => organizationService.acceptApplicant(applicationId),
    onSuccess: () => { toast.success('Applicant accepted! 🎉'); queryClient.invalidateQueries(['applicants']); queryClient.invalidateQueries(['orgStats']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to accept applicant')
  })

  const declineMutation = useMutation({
    mutationFn: (applicationId) => organizationService.declineApplicant(applicationId),
    onSuccess: () => { toast.success('Applicant declined'); queryClient.invalidateQueries(['applicants']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to decline applicant')
  })

  const certificateMutation = useMutation({
    mutationFn: (data) => organizationService.generateCertificate(data),
    onSuccess: () => {
      toast.success('Certificate generated and sent!')
      setCertificateModal({ isOpen: false, applicant: null })
      queryClient.invalidateQueries(['applicants'])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to generate certificate')
  })

  // ── Handlers ────────────────────────────────────────────────────

  const startEdit = (opp) => {
    setEditingOpp(opp.id)
    setEditForm({
      title: opp.title || '',
      description: opp.description || '',
      location: opp.location || '',
      mode: opp.mode || 'onsite',
      category: opp.category || '',
      deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
      requirements: opp.requirements || '',
    })
  }

  const cancelEdit = () => { setEditingOpp(null); setEditForm({}) }

  const saveEdit = (id) => {
    if (!editForm.title?.trim()) return toast.error('Title is required')
    updateOppMutation.mutate({ id, data: editForm })
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

  const statusBadge = (status) => {
    const map = {
      active: { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Active' },
      closed: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Closed' },
      draft:  { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft'  },
    }
    const s = map[status] || map.active
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
  }

  // Filter out expired — backend auto-handles these
  const activeOppsData = oppsData.filter(opp => opp.status !== 'expired')

  if (authLoading || statsLoading || oppsLoading || orgLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>
  }

  return (
    <DynamicBackground category="minimal" overlay={0.85}>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ── Org Card ── */}
          {orgData && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt={orgData.name}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                  ) : null}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                    style={{ display: logoUrl ? 'none' : 'flex' }}>
                    {orgData.name?.charAt(0) || 'O'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gray-900">{orgData.name}</h2>
                      {orgData.isVerified || orgData.verificationStatus === 'approved' ? (
                        <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"><Check className="w-4 h-4" />Verified</span>
                      ) : orgData.verificationStatus === 'pending' ? (
                        <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"><Clock className="w-4 h-4" />Pending</span>
                      ) : (
                        <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"><AlertCircle className="w-4 h-4" />Not Verified</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 leading-relaxed">{orgData.description}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />{orgData.contactDetails}
                    </div>
                    {orgData.verificationStatus === 'pending' && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Pending admin verification. You cannot post opportunities until approved.
                      </div>
                    )}
                    {orgData.verificationStatus === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Verification rejected.{orgData.verificationReason && <> <strong>Reason:</strong> {orgData.verificationReason}</>}
                      </div>
                    )}
                  </div>
                </div>
                <Link to="/org/edit" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap ml-4">
                  <Edit className="w-4 h-4" />Edit Details
                </Link>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100 text-sm text-gray-500">
                Member since {orgData.createdAt ? new Date(orgData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </div>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">{t('activeJobs')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.data?.activeJobs || 0}</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-400 opacity-60" />
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">{t('totalApplicants')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.data?.totalApplicants || 0}</p>
              </div>
              <Users className="w-10 h-10 text-emerald-400 opacity-60" />
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">{t('accepted')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.data?.accepted || 0}</p>
              </div>
              <Heart className="w-10 h-10 text-purple-400 opacity-60" />
            </div>
          </div>

          {/* ── Tabs + Post button ── */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-gray-100">
              <div className="flex gap-1">
                {[
                  { id: 'opportunities', label: `Opportunities (${activeOppsData.length})` },
                  { id: 'applicants',    label: `Applicants (${applicants?.length || 0})` },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
                    style={{
                      borderColor: activeTab === tab.id ? '#059669' : 'transparent',
                      color: activeTab === tab.id ? '#059669' : '#6b7280'
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {orgData?.verificationStatus === 'approved' || orgData?.isVerified ? (
                <Link to="/add-job"
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold mb-1 transition-colors">
                  <Plus className="w-4 h-4" />{t('addJob')}
                </Link>
              ) : null}
            </div>

            <div className="p-6">

              {/* ── Opportunities Tab ── */}
              {activeTab === 'opportunities' && (
                <div className="space-y-4">
                  {oppsLoading ? (
                    <div className="flex justify-center py-12"><Loader /></div>
                  ) : activeOppsData.length === 0 ? (
                    <div className="text-center py-16">
                      <Building2 className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No opportunities posted yet</p>
                      {(orgData?.isVerified || orgData?.verificationStatus === 'approved') && (
                        <Link to="/add-job" className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
                          <Plus className="w-4 h-4" /> Post your first opportunity
                        </Link>
                      )}
                    </div>
                  ) : activeOppsData.map(opp => (
                    <div key={opp.id} className="border border-gray-200 rounded-xl overflow-hidden">

                      {/* ── View mode ── */}
                      {editingOpp !== opp.id ? (
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h4 className="text-lg font-bold text-gray-900">{opp.title}</h4>
                                {statusBadge(opp.status)}
                              </div>
                              <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{opp.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                {opp.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{opp.location}</span>}
                                {opp.mode && <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{opp.mode}</span>}
                                {opp.deadline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>}
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />
                                  {applicants?.filter(a => a.opportunityTitle === opp.title)?.length || 0} applicants
                                </span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => startEdit(opp)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors">
                                <Edit className="w-4 h-4" /> Edit
                              </button>
                              {deleteConfirm === opp.id ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-500 font-medium">Sure?</span>
                                  <button onClick={() => deleteOppMutation.mutate(opp.id)}
                                    disabled={deleteOppMutation.isPending}
                                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                                    {deleteOppMutation.isPending ? '...' : 'Yes, delete'}
                                  </button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(opp.id)}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors">
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              )}
                              <button onClick={() => setExpandedOpp(expandedOpp === opp.id ? null : opp.id)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                                {expandedOpp === opp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded applicants for this opportunity */}
                          {expandedOpp === opp.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Applicants for this opportunity</p>
                              {applicants?.filter(a => a.opportunityTitle === opp.title)?.length > 0 ? (
                                <div className="space-y-2">
                                  {applicants.filter(a => a.opportunityTitle === opp.title).map(app => (
                                    <div key={app.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                          {app.volunteerName?.charAt(0) || 'V'}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-sm text-gray-900">{app.volunteerName}</p>
                                          <p className="text-xs text-gray-400">{app.email}</p>
                                        </div>
                                      </div>
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'}`}>
                                        {app.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 text-center py-4">No applicants yet for this opportunity</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* ── Edit mode ── */
                        <div className="p-5 bg-blue-50/40">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900">Editing opportunity</h4>
                            <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                              <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                              <input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Mode</label>
                              <select value={editForm.mode} onChange={e => setEditForm(p => ({ ...p, mode: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                                <option value="onsite">Onsite</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                              <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
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
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Requirements</label>
                              <textarea value={editForm.requirements} onChange={e => setEditForm(p => ({ ...p, requirements: e.target.value }))}
                                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button onClick={cancelEdit}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors border border-gray-300">
                              Cancel
                            </button>
                            <button onClick={() => saveEdit(opp.id)}
                              disabled={updateOppMutation.isPending}
                              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                              <Save className="w-4 h-4" />
                              {updateOppMutation.isPending ? 'Saving...' : 'Save changes'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Applicants Tab ── */}
              {activeTab === 'applicants' && (
                <div>
                  {applicantsLoading ? (
                    <div className="flex justify-center py-12"><Loader /></div>
                  ) : applicantsError ? (
                    <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                      <p className="text-red-600 font-medium">Failed to load applicants</p>
                    </div>
                  ) : applicants && applicants.length > 0 ? (
                    <div className="space-y-4">
                      {applicants.map((applicant) => (
                        <div key={applicant.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {applicant.volunteerName?.charAt(0) || 'V'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">{applicant.volunteerName}</p>
                                <p className="text-sm text-gray-500">Applied for: <span className="font-medium text-gray-700">{applicant.opportunityTitle}</span></p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{applicant.email}</p>
                                  {applicant.phone && <p className="text-xs text-gray-400">{applicant.phone}</p>}
                                </div>
                                {applicant.skills && <p className="text-xs text-gray-500 mt-1"><strong>Skills:</strong> {applicant.skills}</p>}
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              {applicant.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button onClick={() => acceptMutation.mutate(applicant.id)} disabled={acceptMutation.isPending}
                                    className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50 transition-colors text-sm font-medium">
                                    <Check className="w-4 h-4" />{t('accept')}
                                  </button>
                                  <button onClick={() => declineMutation.mutate(applicant.id)} disabled={declineMutation.isPending}
                                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center gap-1 disabled:opacity-50 transition-colors text-sm font-medium">
                                    <XCircle className="w-4 h-4" />{t('decline')}
                                  </button>
                                </div>
                              )}
                              {applicant.status === 'accepted' && (
                                <div className="flex flex-col gap-2">
                                  <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-medium inline-flex items-center gap-1 text-sm">
                                    <Check className="w-4 h-4" />{t('accepted')}
                                  </span>
                                  <button onClick={() => setCertificateModal({ isOpen: true, applicant })}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors text-sm font-medium">
                                    <Award className="w-4 h-4" />Issue Certificate
                                  </button>
                                </div>
                              )}
                              {applicant.status === 'rejected' && (
                                <span className="px-3 py-2 bg-red-100 text-red-800 rounded-lg font-medium inline-flex items-center gap-1 text-sm">
                                  <XCircle className="w-4 h-4" />{t('rejected')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Users className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No applicants yet</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {activeOppsData.length > 0 ? 'Applications will appear here when volunteers apply.' : 'Post opportunities to start receiving applications.'}
                      </p>
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
