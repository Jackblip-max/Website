import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { register: registerUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    education: 'undergraduate',
    skills: '',
    teamwork: false,
    motivation: ''
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const cleanPhone = formData.phone.replace(/\s/g, '')
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(\+?95|09)\d{7,10}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid Myanmar phone number (e.g., 09xxxxxxxxx)'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Skills validation (optional but should be reasonable if provided)
    if (formData.skills && formData.skills.length > 500) {
      newErrors.skills = 'Skills description should be under 500 characters'
    }

    // Motivation validation (optional but should be reasonable if provided)
    if (formData.motivation && formData.motivation.length > 1000) {
      newErrors.motivation = 'Motivation should be under 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const registerMutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      toast.success('Registration successful! Welcome to MyanVolunteer!')
      navigate('/')
    },
    onError: (error) => {
      console.error('Registration error:', error)
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    console.log('Submitting registration:', { ...formData, password: '***' })
    registerMutation.mutate(formData)
  }

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${backendUrl}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {t('registerTitle')}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Create your account to start volunteering
        </p>
        
        {/* Google Sign Up */}
        <div className="mb-6">
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">{t('googleLogin')}</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">OR</span>
          </div>
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
              placeholder="Your full name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
              placeholder="09xxxxxxxxx or +959xxxxxxxxx"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            {!errors.phone && <p className="text-xs text-gray-500 mt-1">Myanmar phone number format</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              minLength={6}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            {!errors.password && <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('education')}
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('skills')} (Optional)
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Communication, Leadership, Teaching, Organization..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.skills ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              maxLength={500}
            ></textarea>
            {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
            <p className="text-xs text-gray-500 mt-1">{formData.skills.length}/500 characters</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('motivation')} (Optional)
            </label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              placeholder="Tell us why you want to volunteer and what motivates you..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.motivation ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              maxLength={1000}
            ></textarea>
            {errors.motivation && <p className="text-red-500 text-xs mt-1">{errors.motivation}</p>}
            <p className="text-xs text-gray-500 mt-1">{formData.motivation.length}/1000 characters</p>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : t('submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
