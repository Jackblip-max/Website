import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff, CheckCircle, XCircle, Loader as LoaderIcon, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import DynamicBackground from '../components/common/DynamicBackground'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    education: 'undergraduate',
    skills: '',
    // NEW: Preferences
    preferredCategories: [],
    preferredModes: []
  })

  const categories = [
    { value: 'environment', label: 'Environment', icon: '🌱' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'community', label: 'Community', icon: '🤝' },
    { value: 'animals', label: 'Animals', icon: '🐾' },
    { value: 'arts', label: 'Arts & Culture', icon: '🎨' }
  ]

  const modes = [
    { value: 'onsite', label: 'On-site', icon: '📍' },
    { value: 'remote', label: 'Remote', icon: '💻' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔄' }
  ]

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }))
  }

  const toggleMode = (mode) => {
    setFormData(prev => ({
      ...prev,
      preferredModes: prev.preferredModes.includes(mode)
        ? prev.preferredModes.filter(m => m !== mode)
        : [...prev.preferredModes, mode]
    }))
  }

  // ... (keep all your existing validation and mutation code)

  const registerMutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: (response) => {
      toast.success('✅ Registration successful!', { duration: 4000 })
      toast.success('📧 Please check your email to verify your account', { duration: 5000 })
      navigate('/login')
    },
    onError: (error) => {
      console.error('Registration error:', error)
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message, { duration: 5000 })
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      setPasswordStrength(validatePassword(value))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation...
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }
    
    registerMutation.mutate(formData)
  }

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8

    if (!isLongEnough) return 'weak'
    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    if (score === 4) return 'strong'
    if (score >= 2) return 'medium'
    return 'weak'
  }

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 'strong': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'weak': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  return (
    <DynamicBackground category="minimal" overlay={0.85}>
      <div className="min-h-screen py-12 px-4">
        <Link 
          to="/"
          className="inline-flex items-center text-white hover:text-emerald-200 mb-8 transition-colors ml-8 mt-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl">
              MV
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('registerTitle')}</h2>
            <p className="text-gray-600 font-medium">Create your account to start volunteering</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                required
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+95 9xxxxxxxxx or 09xxxxxxxxx"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${getPasswordStrengthColor()}`} style={{width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%'}}></div>
                    </div>
                    <span className={`text-xs font-bold ${passwordStrength === 'strong' ? 'text-green-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                      {passwordStrength === 'strong' ? 'Strong' : passwordStrength === 'medium' ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Education Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('education')}</label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
              >
                <option value="highSchool">{t('highSchool')}</option>
                <option value="undergraduate">{t('undergraduate')}</option>
                <option value="graduate">{t('graduate')}</option>
              </select>
            </div>

            {/* Skills Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Skills (Optional)
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., Communication, Leadership, Teaching..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                rows="3"
              ></textarea>
            </div>

            {/* PREFERENCES SECTION */}
            <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🤖 AI-Powered Personalization
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We prioritize your preferences using <span className="font-bold text-blue-600">Machine Learning</span> to recommend 
                  opportunities that perfectly match your interests. Our AI recommendation engine analyzes your selections 
                  and continuously learns from your interactions to provide increasingly accurate suggestions.
                </p>
                <p className="text-xs text-gray-500 mt-2 italic">
                  💡 Select your preferences below - the more you choose, the better our AI performs!
                </p>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  ❤️ Categories You're Interested In (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => toggleCategory(category.value)}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        formData.preferredCategories.includes(category.value)
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="font-semibold text-xs">{category.label}</div>
                      {formData.preferredCategories.includes(category.value) && (
                        <div className="mt-1 text-white text-xs">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modes */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  💼 Preferred Work Mode (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {modes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => toggleMode(mode.value)}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        formData.preferredModes.includes(mode.value)
                          ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-3xl mb-1">{mode.icon}</div>
                      <div className="font-bold">{mode.label}</div>
                      {formData.preferredModes.includes(mode.value) && (
                        <div className="mt-1 text-white font-semibold text-sm">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-xl"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </DynamicBackground>
  )
}

export default Register
