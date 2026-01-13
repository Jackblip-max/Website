import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  Shield, Users, Building2, FileCheck, Activity, 
  CheckCircle, XCircle, Trash2, Search, 
  AlertTriangle, Clock, Mail, Phone, LogOut,
  Eye, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [actionModal, setActionModal] = useState(null)
  const [actionReason, setActionReason] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }
    
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      navigate('/')
    }
  }, [user, isAuthenticated, navigate])

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats')
      return response.data
    },
    enabled: user?.role === 'admin'
  })

  // Fetch pending organizations
  const { data: pendingOrgs, isLoading: orgsLoading } = useQuery({
    queryKey: ['pendingOrganizations'],
    queryFn: async () => {
      const response = await api.get('/admin/organizations/pending')
      return response.data
    },
    enabled: user?.role === 'admin'
  })

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers', searchQuery],
    queryFn: async () => {
      const params = searchQuery ? `?search=${searchQuery}` : ''
      const response = await api.get(`/admin/users${params}`)
      return response.data
    },
    enabled: user?.role === 'admin' && activeTab === 'users'
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, message }) => {
      const response = await api.put(`/admin/organizations/${id}/approve`, { message })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingOrganizations'])
      queryClient.invalidateQueries(['adminStats'])
      setActionModal(null)
      setSelectedOrg(null)
      setActionReason('')
      toast.success('✅ Organization approved successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve organization')
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      const response = await api.put(`/admin/organizations/${id}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingOrganizations'])
      queryClient.invalidateQueries(['adminStats'])
      setActionModal(null)
      setSelectedOrg(null)
      setActionReason('')
      toast.success('Organization rejected')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject organization')
    }
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      const response = await api.delete(`/admin/users/${id}`, { data: { reason } })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers'])
      queryClient.invalidateQueries(['adminStats'])
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  })

  const handleApprove = (org) => {
    setSelectedOrg(org)
    setActionModal('approve')
  }

  const handleReject = (org) => {
    setSelectedOrg(org)
    setActionModal('reject')
  }

  const confirmApprove = () => {
    approveMutation.mutate({
      id: selectedOrg.id,
      message: actionReason || 'Organization verified and approved'
    })
  }

  const confirmReject = () => {
    if (!actionReason || actionReason.length < 10) {
      toast.error('Please provide a detailed rejection reason (minimum 10 characters)')
      return
    }
    rejectMutation.mutate({
      id: selectedOrg.id,
      reason: actionReason
    })
  }

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      const reason = prompt('Please provide a reason for deletion:')
      if (reason && reason.length >= 10) {
        deleteUserMutation.mutate({ id: userId, reason })
      } else {
        toast.error('Deletion reason must be at least 10 characters')
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-100">MyanVolunteer Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-blue-100">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Users"
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatCard
            icon={<Building2 className="w-8 h-8" />}
            title="Total Organizations"
            value={stats?.totalOrganizations || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-8 h-8" />}
            title="Pending Reviews"
            value={stats?.pendingOrganizations || 0}
            color="orange"
            highlight={stats?.pendingOrganizations > 0}
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Approved Orgs"
            value={stats?.approvedOrganizations || 0}
            color="emerald"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<Activity />}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
              icon={<FileCheck />}
              label={`Pending (${stats?.pendingOrganizations || 0})`}
              badge={stats?.pendingOrganizations > 0}
            />
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={<Users />}
              label="Users"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} />
          )}

          {activeTab === 'pending' && (
            <PendingOrganizationsTab
              organizations={pendingOrgs || []}
              loading={orgsLoading}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={users || []}
              loading={usersLoading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && selectedOrg && (
        <ActionModal
          type={actionModal}
          organization={selectedOrg}
          reason={actionReason}
          setReason={setActionReason}
          onConfirm={actionModal === 'approve' ? confirmApprove : confirmReject}
          onCancel={() => {
            setActionModal(null)
            setSelectedOrg(null)
            setActionReason('')
          }}
          loading={approveMutation.isPending || rejectMutation.isPending}
        />
      )}
    </div>
  )
}

// StatCard Component
const StatCard = ({ icon, title, value, color, highlight }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    emerald: 'from-emerald-500 to-emerald-600'
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg p-6 ${highlight ? 'ring-4 ring-orange-300 animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="opacity-80">{icon}</div>
        {highlight && <AlertTriangle className="w-6 h-6 animate-bounce" />}
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

// TabButton Component
const TabButton = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
      active
        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span>{label}</span>
    {badge && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
    )}
  </button>
)

// OverviewTab Component
const OverviewTab = ({ stats }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Organization Stats
        </h3>
        <div className="space-y-3">
          <StatRow label="Total Organizations" value={stats?.totalOrganizations || 0} />
          <StatRow label="Approved" value={stats?.approvedOrganizations || 0} color="green" />
          <StatRow label="Pending Review" value={stats?.pendingOrganizations || 0} color="orange" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Platform Activity
        </h3>
        <div className="space-y-3">
          <StatRow label="Total Users" value={stats?.totalUsers || 0} />
          <StatRow label="Active Opportunities" value={stats?.totalOpportunities || 0} />
          <StatRow label="Total Applications" value={stats?.totalApplications || 0} />
        </div>
      </div>
    </div>
  </div>
)

// StatRow Component
const StatRow = ({ label, value, color = 'gray' }) => {
  const colors = {
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    gray: 'text-gray-900 bg-gray-50'
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold px-3 py-1 rounded-full ${colors[color]}`}>
        {value}
      </span>
    </div>
  )
}

// PendingOrganizationsTab Component
const PendingOrganizationsTab = ({ organizations, loading, onApprove, onReject }) => {
  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-900">All caught up!</p>
        <p className="text-gray-600 mt-2">No pending organization verifications</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Pending Organizations ({organizations.length})
      </h2>
      <div className="space-y-4">
        {organizations.map((org) => (
          <OrganizationCard
            key={org.id}
            organization={org}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  )
}

// OrganizationCard Component
const OrganizationCard = ({ organization, onApprove, onReject }) => (
  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
            {organization.name?.charAt(0) || 'O'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{organization.name}</h3>
            <p className="text-sm text-gray-600">Applied {new Date(organization.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Contact Details</p>
            <p className="text-gray-600 text-sm">{organization.contactDetails}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">User Information</p>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{organization.user?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{organization.user?.email}</span>
              </div>
              {organization.user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{organization.user?.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
          <p className="text-gray-600 text-sm leading-relaxed">{organization.description}</p>
        </div>
      </div>
    </div>

    <div className="flex gap-3 pt-4 border-t border-gray-200">
      <button
        onClick={() => onApprove(organization)}
        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <CheckCircle className="w-5 h-5" />
        Approve Organization
      </button>
      <button
        onClick={() => onReject(organization)}
        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <XCircle className="w-5 h-5" />
        Reject Application
      </button>
    </div>
  </div>
)

// UsersTab Component
const UsersTab = ({ users, loading, searchQuery, setSearchQuery, onDeleteUser }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading users...</div>
      ) : users && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Verified</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    {user.organization && (
                      <div className="text-xs text-gray-500">
                        Org: {user.organization.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'organization' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => onDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  )
}

// ActionModal Component
const ActionModal = ({ type, organization, reason, setReason, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {type === 'approve' ? '✅ Approve Organization' : '❌ Reject Application'}
      </h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">{organization.name}</p>
        <p className="text-sm text-gray-600 mt-1">{organization.user?.email}</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {type === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason (Required)'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={type === 'approve' 
            ? 'Add a welcome message (optional)...' 
            : 'Explain why this application is being rejected (minimum 10 characters)...'}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          required={type === 'reject'}
        />
        {type === 'reject' && (
          <p className="text-xs text-gray-500 mt-1">
            Be specific and constructive. This will be sent to the organization.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading || (type === 'reject' && reason.length < 10)}
          className={`flex-1 px-4 py-3 rounded-lg font-medium text-white disabled:opacity-50 ${
            type === 'approve' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {loading ? 'Processing...' : type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        </button>
      </div>
    </div>
  </div>
)

export default AdminDashboard
