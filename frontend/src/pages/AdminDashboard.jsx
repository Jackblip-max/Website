import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  Shield, Users, Building2, FileCheck, Activity, 
  CheckCircle, XCircle, Trash2, Search, 
  AlertTriangle, Clock, Mail, Phone, LogOut, X
} from 'lucide-react'
import { adminAuthService } from '../services/adminAuthService'
import api from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [actionModal, setActionModal] = useState(null) // 'approve'|'reject'|'deleteUser'|'deleteOrg'
  const [actionReason, setActionReason] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const adminUser = adminAuthService.getCurrentAdmin()

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats')
      return response || {}
    },
    enabled: !!adminUser,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true
  })

  const { data: pendingOrgs, isLoading: orgsLoading } = useQuery({
    queryKey: ['pendingOrganizations'],
    queryFn: async () => {
      const response = await api.get('/admin/organizations/pending')
      return Array.isArray(response) ? response : (response?.data || [])
    },
    enabled: !!adminUser,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers', searchQuery],
    queryFn: async () => {
      const params = searchQuery ? `?search=${searchQuery}` : ''
      const response = await api.get(`/admin/users${params}`)
      return Array.isArray(response) ? response : (response?.data || [])
    },
    enabled: !!adminUser && activeTab === 'users',
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true
  })

  const closeModal = () => {
    setActionModal(null)
    setSelectedOrg(null)
    setSelectedUser(null)
    setActionReason('')
  }

  const approveMutation = useMutation({
    mutationFn: ({ id, message }) => api.post(`/admin/organizations/${id}/approve`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingOrganizations'])
      queryClient.invalidateQueries(['adminStats'])
      closeModal()
      toast.success('Organization approved!')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to approve')
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/admin/organizations/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingOrganizations'])
      queryClient.invalidateQueries(['adminStats'])
      closeModal()
      toast.success('Organization rejected')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to reject')
  })

  const deleteUserMutation = useMutation({
    mutationFn: ({ id, reason }) => api.delete(`/admin/users/${id}`, { data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers'])
      queryClient.invalidateQueries(['adminStats'])
      closeModal()
      toast.success('User deleted successfully')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete user')
  })

  const deleteOrgMutation = useMutation({
    mutationFn: ({ id, reason }) => api.delete(`/admin/organizations/${id}`, { data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers'])
      queryClient.invalidateQueries(['adminStats'])
      closeModal()
      toast.success('Organization removed. User account is still active.')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to remove organization')
  })

  const isLoading = approveMutation.isPending || rejectMutation.isPending ||
    deleteUserMutation.isPending || deleteOrgMutation.isPending

  const confirmAction = () => {
    if (actionModal === 'approve') approveMutation.mutate({ id: selectedOrg.id, message: actionReason || 'Organization verified and approved' })
    else if (actionModal === 'reject') rejectMutation.mutate({ id: selectedOrg.id, reason: actionReason })
    else if (actionModal === 'deleteUser') deleteUserMutation.mutate({ id: selectedUser.id, reason: actionReason })
    else if (actionModal === 'deleteOrg') deleteOrgMutation.mutate({ id: selectedUser.organization.id, reason: actionReason })
  }

  const modalConfig = {
    approve: {
      title: 'Approve Organization',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      label: 'Confirm Approval',
      btnClass: 'bg-green-600 hover:bg-green-700',
      placeholder: 'Add a welcome message (optional)...',
      required: false,
      description: `Approving "${selectedOrg?.name}" will allow them to post volunteer opportunities.`,
      color: 'green'
    },
    reject: {
      title: 'Reject Application',
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      label: 'Confirm Rejection',
      btnClass: 'bg-red-600 hover:bg-red-700',
      placeholder: 'Explain why this application is being rejected...',
      required: true,
      description: `Rejecting "${selectedOrg?.name}". The organization will be notified with your reason.`,
      color: 'red'
    },
    deleteUser: {
      title: 'Delete User Account',
      icon: <Trash2 className="w-6 h-6 text-red-500" />,
      label: 'Delete User',
      btnClass: 'bg-red-600 hover:bg-red-700',
      placeholder: 'Provide a reason for deleting this account...',
      required: true,
      description: `Permanently deleting "${selectedUser?.name}"${selectedUser?.organization ? ` and their organization "${selectedUser.organization.name}"` : ''}. This cannot be undone.`,
      color: 'red'
    },
    deleteOrg: {
      title: 'Remove Organization Only',
      icon: <Building2 className="w-6 h-6 text-orange-500" />,
      label: 'Remove Organization',
      btnClass: 'bg-orange-600 hover:bg-orange-700',
      placeholder: 'Provide a reason for removing this organization...',
      required: true,
      description: `Removing organization "${selectedUser?.organization?.name}". The user account "${selectedUser?.name}" will remain active — they can still volunteer.`,
      color: 'orange'
    }
  }

  const config = actionModal ? modalConfig[actionModal] : null

  const descBg = { green: 'bg-green-50 border-green-100 text-green-800', red: 'bg-red-50 border-red-100 text-red-800', orange: 'bg-orange-50 border-orange-100 text-orange-800' }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100">MyanVolunteer Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{adminUser?.name || 'Admin'}</p>
              <p className="text-sm text-blue-100">{adminUser?.email}</p>
            </div>
            <button onClick={() => { adminAuthService.logout(); navigate('/admin/login') }}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <LogOut className="w-4 h-4" /><span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users className="w-8 h-8" />} title="Total Users" value={stats?.totalUsers ?? 0} color="blue" />
          <StatCard icon={<Building2 className="w-8 h-8" />} title="Total Organizations" value={stats?.totalOrganizations ?? 0} color="green" />
          <StatCard icon={<Clock className="w-8 h-8" />} title="Pending Reviews" value={stats?.pendingOrganizations ?? 0} color="orange" highlight={stats?.pendingOrganizations > 0} />
          <StatCard icon={<CheckCircle className="w-8 h-8" />} title="Approved Orgs" value={stats?.approvedOrganizations ?? 0} color="emerald" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity />} label="Overview" />
            <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} icon={<FileCheck />}
              label={`Pending (${stats?.pendingOrganizations ?? 0})`} badge={stats?.pendingOrganizations > 0} />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Users" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'pending' && (
            <PendingOrganizationsTab
              organizations={pendingOrgs || []} loading={orgsLoading}
              onApprove={(org) => { setSelectedOrg(org); setActionModal('approve') }}
              onReject={(org) => { setSelectedOrg(org); setActionModal('reject') }}
            />
          )}
          {activeTab === 'users' && (
            <UsersTab
              users={users || []} loading={usersLoading}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              onDeleteUser={(user) => { setSelectedUser(user); setActionModal('deleteUser') }}
              onDeleteOrg={(user) => { setSelectedUser(user); setActionModal('deleteOrg') }}
            />
          )}
        </div>
      </div>

      {/* Unified Modal */}
      {actionModal && config && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {config.icon}
                <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className={`p-4 rounded-xl text-sm border ${descBg[config.color]}`}>
                {config.description}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {config.required ? 'Reason' : 'Message'}
                  {config.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={config.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all"
                  autoFocus
                />
                {config.required && (
                  <p className={`text-xs mt-1 ${actionReason.trim().length >= 10 ? 'text-green-500' : 'text-gray-400'}`}>
                    {actionReason.trim().length}/10 minimum characters
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} disabled={isLoading}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 text-sm">
                Cancel
              </button>
              <button onClick={confirmAction}
                disabled={isLoading || (config.required && actionReason.trim().length < 10)}
                className={`flex-1 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm ${config.btnClass}`}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : config.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, title, value, color, highlight }) => {
  const colors = { blue: 'from-blue-500 to-blue-600', green: 'from-green-500 to-green-600', orange: 'from-orange-500 to-orange-600', emerald: 'from-emerald-500 to-emerald-600' }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg p-6 ${highlight ? 'ring-4 ring-orange-300' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="opacity-80">{icon}</div>
        {highlight && <AlertTriangle className="w-5 h-5" />}
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

const TabButton = ({ active, onClick, icon, label, badge }) => (
  <button onClick={onClick} className={`relative flex items-center gap-2 px-6 py-4 font-medium transition-all ${active ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span>{label}</span>
    {badge && <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />}
  </button>
)

const OverviewTab = ({ stats }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" />Organization Stats</h3>
        <div className="space-y-3">
          <StatRow label="Total Organizations" value={stats?.totalOrganizations ?? 0} />
          <StatRow label="Approved" value={stats?.approvedOrganizations ?? 0} color="green" />
          <StatRow label="Pending Review" value={stats?.pendingOrganizations ?? 0} color="orange" />
        </div>
      </div>
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-600" />Platform Activity</h3>
        <div className="space-y-3">
          <StatRow label="Total Users" value={stats?.totalUsers ?? 0} />
          <StatRow label="Active Opportunities" value={stats?.totalOpportunities ?? 0} />
          <StatRow label="Total Applications" value={stats?.totalApplications ?? 0} />
        </div>
      </div>
    </div>
  </div>
)

const StatRow = ({ label, value, color = 'gray' }) => {
  const colors = { green: 'text-green-600 bg-green-50', orange: 'text-orange-600 bg-orange-50', gray: 'text-gray-900 bg-gray-50' }
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`font-bold px-3 py-1 rounded-full text-sm ${colors[color]}`}>{value}</span>
    </div>
  )
}

const PendingOrganizationsTab = ({ organizations, loading, onApprove, onReject }) => {
  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>
  if (!organizations?.length) return (
    <div className="text-center py-16">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <p className="text-xl font-semibold text-gray-800">All caught up!</p>
      <p className="text-gray-400 mt-1 text-sm">No pending organization verifications</p>
    </div>
  )
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Organizations ({organizations.length})</h2>
      <div className="space-y-4">
        {organizations.map((org) => (
          <div key={org.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {org.name?.charAt(0) || 'O'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{org.name}</h3>
                <p className="text-xs text-gray-400">Applied {new Date(org.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="font-semibold text-gray-600 mb-1 text-xs uppercase tracking-wide">Contact</p>
                <p className="text-gray-700">{org.contactDetails}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600 mb-1 text-xs uppercase tracking-wide">Submitted by</p>
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" />{org.user?.name}</div>
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{org.user?.email}</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">{org.description}</p>
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => onApprove(org)} className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 transition-colors text-sm">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => onReject(org)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition-colors text-sm">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const UsersTab = ({ users, loading, searchQuery, setSearchQuery, onDeleteUser, onDeleteOrg }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-60" />
      </div>
    </div>
    {loading ? (
      <div className="text-center py-12 text-gray-400">Loading users...</div>
    ) : users?.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['User', 'Email', 'Phone', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                  {user.organization && <div className="text-xs text-gray-400 mt-0.5">Org: {user.organization.name}</div>}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{user.phone || '—'}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'organization' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>{user.role}</span>
                </td>
                <td className="px-4 py-3.5">
                  {user.isVerified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3.5">
                  {user.role !== 'admin' && (
                    <div className="flex items-center gap-1">
                      {user.organization && (
                        <button onClick={() => onDeleteOrg(user)}
                          title="Remove organization only (keep user)"
                          className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <Building2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => onDeleteUser(user)}
                        title="Delete user account"
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
    )}
  </div>
)

export default AdminDashboard
