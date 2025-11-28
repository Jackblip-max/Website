import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { Edit2, Save, X } from 'lucide-react'

const Profile = () => {
  const { t } = useLanguage()
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    education: user?.volunteer?.education || 'undergraduate',
    skills: user?.volunteer?.skills || '',
    teamwork: user?.volunteer?.teamwork || false,
    motivation: user?.volunteer?.motivation || '',
    notificationsEnabled: user?.volunteer?.notificationsEnabled || true
  })

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
      teamwork: user?.volunteer?.teamwork || false,
      motivation: user?.volunteer?.motivation || '',
      notificationsEnabled: user?.volunteer?.notificationsEnabled || true
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('myProfile')}</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Edit2 className="w-4 h-4" />
              <span>{t('edit')}</span>
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
          // View Mode
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">{t('name')}</label>
                <p className="text-lg text-gray-900 font-medium">{user?.name || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">{t('email')}</label>
                <p className="text-lg text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">{t('phone')}</label>
                <p className="text-lg text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                <p className="text-lg text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>

            {user?.volunteer && (
              <>
                <div className="border-b border-gray-200 pb-4 mt-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Volunteer Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{t('education')}</label>
                    <p className="text-lg text-gray-900 capitalize">
                      {t(user.volunteer.education) || user.volunteer.education}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{t('skills')}</label>
                    <p className="text-lg text-gray-900">{user.volunteer.skills || 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Teamwork</label>
                    <p className="text-lg text-gray-900">
                      {user.volunteer.teamwork ? '✓ Works well with others' : 'Prefers individual work'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{t('motivation')}</label>
                    <p className="text-lg text-gray-900">{user.volunteer.motivation || 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Notifications</label>
                    <p className="text-lg text-gray-900">
                      {user.volunteer.notificationsEnabled ? '✓ Enabled' : '✗ Disabled'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')}</label>
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

            {user?.volunteer && (
              <>
                <div className="border-b border-gray-200 pb-4 mt-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Volunteer Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('education')}</label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="highSchool">{t('highSchool')}</option>
                    <option value="undergraduate">{t('undergraduate')}</option>
                    <option value="graduate">{t('graduate')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('skills')}</label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., Communication, Leadership, Teaching..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="teamwork"
                    id="teamwork"
                    checked={formData.teamwork}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="teamwork" className="ml-2 text-sm text-gray-700">
                    {t('teamwork')}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('motivation')}</label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    placeholder="Tell us why you want to volunteer..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="notificationsEnabled"
                    id="notifications"
                    checked={formData.notificationsEnabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="notifications" className="ml-2 text-sm text-gray-700">
                    {t('enableNotifications')}
                  </label>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
