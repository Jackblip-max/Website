import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { Edit2, Save, X, Building2, Plus } from 'lucide-react'
import DynamicBackground from '../components/common/DynamicBackground'

const Profile = () => {
  const { t } = useLanguage()
  const { user, updateUser, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '', phone: '', education: 'undergraduate',
    skills: '', notificationsEnabled: true
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to view your profile')
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        education: user.volunteer?.education || 'undergraduate',
        skills: user.volunteer?.skills || '',
        notificationsEnabled: user.volunteer?.notificationsEnabled ?? true
      })
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.user)
      queryClient.invalidateQueries(['profile'])
      toast.success('Profile updated!')
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      education: user?.volunteer?.education || 'undergraduate',
      skills: user?.volunteer?.skills || '',
      notificationsEnabled: user?.volunteer?.notificationsEnabled ?? true
    })
    setIsEditing(false)
  }

  if (loading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DynamicBackground category="minimal" overlay={0.85}>
      <div className="min-h-screen py-6 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-5 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-2xl sm:text-4xl flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">{user?.name}</h1>
                <p className="text-emerald-100 text-sm sm:text-lg">{user?.email}</p>
                {user?.isVerified && (
                  <span className="inline-block mt-2 bg-green-500 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 sm:space-x-2 bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors text-xs sm:text-sm">
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <button onClick={handleCancel}
                  className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-700 font-medium text-sm">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {[
                    { label: 'Full Name', value: user?.name || 'Not provided' },
                    { label: 'Email Address', value: user?.email },
                    { label: 'Phone Number', value: user?.phone || 'Not provided' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">{label}</label>
                      <p className="text-sm sm:text-lg text-gray-900 font-medium break-words">{value}</p>
                    </div>
                  ))}
                </div>

                {user?.role === 'volunteer' && user?.volunteer && (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Volunteer Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                        <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Education</label>
                        <p className="text-sm sm:text-lg text-gray-900 font-medium capitalize">
                          {user.volunteer.education === 'highSchool' ? 'High School' :
                           user.volunteer.education === 'undergraduate' ? 'Undergraduate' :
                           user.volunteer.education === 'graduate' ? 'Graduate' : user.volunteer.education}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                        <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Notifications</label>
                        <p className="text-sm sm:text-lg text-gray-900">
                          {user.volunteer.notificationsEnabled
                            ? <span className="text-green-600 font-medium">✓ Enabled</span>
                            : <span className="text-gray-500 font-medium">✗ Disabled</span>}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Skills & Expertise</label>
                        <p className="text-sm sm:text-base text-gray-900">{user.volunteer.skills || 'No skills specified yet'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="09xxxxxxxxx"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
                  </div>
                </div>

                {user?.role === 'volunteer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Education Level</label>
                      <select name="education" value={formData.education} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                        <option value="highSchool">High School</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="graduate">Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills & Expertise</label>
                      <textarea name="skills" value={formData.skills} onChange={handleChange}
                        placeholder="e.g., Communication, Leadership, Teaching..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                        rows="4"></textarea>
                    </div>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" name="notificationsEnabled" id="notifications"
                        checked={formData.notificationsEnabled} onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5" />
                      <div>
                        <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                          Enable email notifications
                        </label>
                        <p className="text-xs text-gray-500">Receive deadline reminders and application updates</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" disabled={updateMutation.isPending}
                    className="flex-1 bg-emerald-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base">
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button type="button" onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 font-medium transition-colors text-sm sm:text-base">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Create Org CTA */}
          {user?.role === 'volunteer' && !user?.organization && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 sm:p-8 text-center">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Want to post volunteer opportunities?</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                Create your organization profile to start posting volunteer opportunities.
              </p>
              <Link to="/create-organization"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl hover:bg-emerald-700 font-bold transition-colors shadow-lg text-sm sm:text-base">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Create Organization</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DynamicBackground>
  )
}

export default Profile
