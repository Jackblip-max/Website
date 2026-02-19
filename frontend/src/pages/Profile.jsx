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
    name: '',
    phone: '',
    education: 'undergraduate',
    skills: '',
    notificationsEnabled: true
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to view your profile')
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  // Initialize form data when user data is available
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
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show message (redirect will happen via useEffect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

 return (
  <DynamicBackground category="minimal" overlay={0.85}>
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">  {/* ✅ ADDED THIS LINE */}
        
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-4xl">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-emerald-100 text-lg">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                {user.isVerified && (
                  <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 font-medium"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {!isEditing ? (
            // View Mode - Display Basic Information Only
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-lg text-gray-900 font-medium">{user.name || 'Not provided'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  <p className="text-lg text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
              </div>

              {/* Additional Info for Volunteers */}
              {user.role === 'volunteer' && user.volunteer && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Education Level</label>
                      <p className="text-lg text-gray-900 capitalize font-medium">
                        {user.volunteer.education === 'highSchool' ? 'High School' :
                         user.volunteer.education === 'undergraduate' ? 'Undergraduate' :
                         user.volunteer.education === 'graduate' ? 'Graduate' :
                         user.volunteer.education}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Notifications</label>
                      <p className="text-lg text-gray-900">
                        {user.volunteer.notificationsEnabled ? (
                          <span className="text-green-600 font-medium">✓ Enabled</span>
                        ) : (
                          <span className="text-gray-600 font-medium">✗ Disabled</span>
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Skills & Expertise</label>
                      <p className="text-lg text-gray-900">
                        {user.volunteer.skills || 'No skills specified yet'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode - Form to update information
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700">Edit Your Information</h3>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="09xxxxxxxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Volunteer-specific fields */}
              {user.role === 'volunteer' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Volunteer Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="highSchool">High School</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills & Expertise
                    </label>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., Communication, Leadership, Teaching, Community Organization..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      rows="4"
                    ></textarea>
                    <p className="text-sm text-gray-500 mt-1">
                      List your skills that would be helpful for volunteer work
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="notificationsEnabled"
                        id="notifications"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                        Enable email notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Receive deadline reminders and application updates via email
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Create Organization CTA - Only show if user is volunteer and has NO organization */}
        {user.role === 'volunteer' && !user.organization && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Want to post volunteer opportunities?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Create your organization profile to start posting volunteer opportunities and managing applications.
            </p>
            <Link
              to="/create-organization"
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 font-bold transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create Organization</span>
            </Link>
          </div>
        )}
        
      </div>  {/* ✅ CLOSE MAX-WIDTH CONTAINER */}
    </div>
  </DynamicBackground>
)
}

export default Profile
