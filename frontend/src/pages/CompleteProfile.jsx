import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

const CompleteProfile = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { checkAuth, user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    education: 'undergraduate',
    skills: '',
    teamwork: false,
    motivation: ''
  })

  useEffect(() => {
    console.log('CompleteProfile mounted')
    console.log('Is authenticated:', isAuthenticated)
    console.log('User:', user)
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      toast.error('Please login first')
      navigate('/login')
      return
    }
    
    if (user) {
      console.log('User data available, populating form')
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }))
      setLoading(false)
    } else {
      // If authenticated but no user data yet, wait a moment
      const timer = setTimeout(() => {
        if (!user) {
          console.log('No user data after timeout, checking auth')
          checkAuth().then(() => setLoading(false))
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, navigate, checkAuth])

  const completeMutation = useMutation({
    mutationFn: (data) => {
      console.log('Submitting profile data:', data)
      return authService.completeProfile(data)
    },
    onSuccess: async (response) => {
      console.log('Profile completion response:', response)
      // Update local auth state
      await checkAuth()
      toast.success('Profile completed successfully!')
      navigate('/')
    },
    onError: (error) => {
      console.error('Complete profile error:', error)
      console.error('Error response:', error.response?.data)
      const message = error.response?.data?.message || 'Failed to complete profile'
      toast.error(message)
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
    
    console.log('Form data before validation:', formData)
    
    // Validate required fields
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    console.log('Submitting complete profile with data:', formData)
    completeMutation.mutate(formData)
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">
            Welcome! Please provide additional information to complete your volunteer profile.
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+95 9xxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter your phone number with country code</p>
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
              checked={formData.teamwork}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label className="ml-2 text-sm text-gray-700">{t('teamwork')}</label>
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

          <button
            type="submit"
            disabled={completeMutation.isPending}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 transition-colors"
          >
            {completeMutation.isPending ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile
