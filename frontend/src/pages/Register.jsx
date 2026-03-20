import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff, CheckCircle, XCircle, Loader as LoaderIcon, ArrowLeft, AlertCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import DynamicBackground from '../components/common/DynamicBackground'
import api from '../services/api'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [fieldValidation, setFieldValidation] = useState({
    email: { checking: false, valid: null, message: '' },
    phone: { checking: false, valid: null, message: '' },
    name: { valid: null, message: '' },
    password: { valid: null, message: '' }
  })
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    education: 'undergraduate', skills: '',
    preferredCategories: [], preferredModes: []
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

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
  }

  const debouncedEmail = useDebounce(formData.email, 500)
  const debouncedPhone = useDebounce(formData.phone, 500)
  const debouncedName = useDebounce(formData.name, 500)

  const checkFieldAvailability = async (fieldName, value, endpoint, minLength = 0) => {
    if (!value || value.length < minLength) return
    setFieldValidation(prev => ({ ...prev, [fieldName]: { checking: true, valid: null, message: 'Checking...' } }))
    try {
      const response = await api.post(endpoint, { [fieldName]: value })
      setFieldValidation(prev => ({
        ...prev,
        [fieldName]: { checking: false, valid: response.available, message: response.message || '' }
      }))
    } catch {
      setFieldValidation(prev => ({ ...prev, [fieldName]: { checking: false, valid: null, message: '' } }))
    }
  }

  useEffect(() => { checkFieldAvailability('name', debouncedName, '/auth/check-name', 2) }, [debouncedName])
  useEffect(() => { if (debouncedEmail?.includes('@')) checkFieldAvailability('email', debouncedEmail, '/auth/check-email') }, [debouncedEmail])
  useEffect(() => { checkFieldAvailability('phone', debouncedPhone, '/auth/check-phone', 8) }, [debouncedPhone])

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

  useEffect(() => {
    if (!formData.password) {
      setFieldValidation(prev => ({ ...prev, password: { valid: null, message: '' } }))
    } else if (formData.password.length < 8) {
      setFieldValidation(prev => ({ ...prev, password: { valid: false, message: 'Minimum 8 characters' } }))
    } else {
      const strength = validatePassword(formData.password)
      setFieldValidation(prev => ({
        ...prev,
        password: { valid: strength !== 'weak', message: strength === 'strong' ? 'Strong!' : strength === 'medium' ? 'Good' : 'Weak' }
      }))
    }
  }, [formData.password])

  const toggleCategory = (cat) => setFormData(prev => ({
    ...prev, preferredCategories: prev.preferredCategories.includes(cat)
      ? prev.preferredCategories.filter(c => c !== cat) : [...prev.preferredCategories, cat]
  }))

  const toggleMode = (mode) => setFormData(prev => ({
    ...prev, preferredModes: prev.preferredModes.includes(mode)
      ? prev.preferredModes.filter(m => m !== mode) : [...prev.preferredModes, mode]
  }))

  const registerMutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      toast.success('Registration successful! Check your email to verify.', { duration: 5000 })
      navigate('/login')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message, { duration: 5000 })
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') setPasswordStrength(validatePassword(value))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields'); return
    }
    if (fieldValidation.name.valid === false) { toast.error('Name is already taken'); return }
    if (fieldValidation.email.valid === false) { toast.error('Email is already registered'); return }
    if (fieldValidation.phone.valid === false) { toast.error('Phone number is already registered'); return }
    if (fieldValidation.password.valid === false) { toast.error('Please use a stronger password'); return }
    registerMutation.mutate(formData)
  }

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 'strong': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'weak': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const FieldValidationIcon = ({ field }) => {
    const v = fieldValidation[field]
    if (v.checking) return <LoaderIcon className="w-4 h-4 text-blue-500 animate-spin" />
    if (v.valid === true) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (v.valid === false) return <XCircle className="w-4 h-4 text-red-500" />
    return null
  }

  const FieldMessage = ({ field }) => {
    const v = fieldValidation[field]
    if (!v.message) return null
    const colorClass = v.valid === true ? 'text-green-600' : v.valid === false ? 'text-red-600' : 'text-blue-600'
    return <p className={`text-xs mt-1 ${colorClass} flex items-center gap-1`}>{v.valid === false && <AlertCircle className="w-3 h-3" />}{v.message}</p>
  }

  const inputBase = "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm pr-10"

  return (
    <DynamicBackground category="minimal" overlay={0.85}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center text-white hover:text-emerald-200 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto mb-4 shadow-xl">MV</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{t('registerTitle')}</h2>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Create your account to start volunteering</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('name')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="John Doe" required
                    className={`${inputBase} ${fieldValidation.name.valid === false ? 'border-red-300' : fieldValidation.name.valid === true ? 'border-green-300' : 'border-gray-300'}`} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2"><FieldValidationIcon field="name" /></div>
                </div>
                <FieldMessage field="name" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('email')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="your.email@example.com" required
                    className={`${inputBase} ${fieldValidation.email.valid === false ? 'border-red-300' : fieldValidation.email.valid === true ? 'border-green-300' : 'border-gray-300'}`} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2"><FieldValidationIcon field="email" /></div>
                </div>
                <FieldMessage field="email" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('phone')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+95 9xxxxxxxxx or 09xxxxxxxxx" required
                    className={`${inputBase} ${fieldValidation.phone.valid === false ? 'border-red-300' : fieldValidation.phone.valid === true ? 'border-green-300' : 'border-gray-300'}`} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2"><FieldValidationIcon field="phone" /></div>
                </div>
                <FieldMessage field="phone" />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('password')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    placeholder="Min. 8 characters" required
                    className={`${inputBase} ${fieldValidation.password.valid === false ? 'border-red-300' : fieldValidation.password.valid === true ? 'border-green-300' : 'border-gray-300'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${getPasswordStrengthColor()}`}
                          style={{width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%'}}></div>
                      </div>
                      <span className={`text-xs font-bold ${passwordStrength === 'strong' ? 'text-green-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                        {passwordStrength === 'strong' ? 'Strong' : passwordStrength === 'medium' ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('education')}</label>
                <select name="education" value={formData.education} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                  <option value="highSchool">{t('highSchool')}</option>
                  <option value="undergraduate">{t('undergraduate')}</option>
                  <option value="graduate">{t('graduate')}</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Skills (Optional)</label>
                <textarea name="skills" value={formData.skills} onChange={handleChange}
                  placeholder="e.g., Communication, Leadership, Teaching..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  rows="3"></textarea>
              </div>

              {/* Preferences */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border-2 border-blue-200">
                <div className="text-center mb-4">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1">💡 Your Preferences</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Help us show you the most relevant opportunities.</p>
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">❤️ Interested Categories (Optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button key={cat.value} type="button" onClick={() => toggleCategory(cat.value)}
                        className={`p-2 sm:p-3 rounded-xl border-2 transition-all text-center ${
                          formData.preferredCategories.includes(cat.value)
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400'
                        }`}>
                        <div className="text-xl sm:text-2xl mb-0.5">{cat.icon}</div>
                        <div className="font-semibold text-xs leading-tight">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modes */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">💼 Preferred Work Mode (Optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {modes.map(mode => (
                      <button key={mode.value} type="button" onClick={() => toggleMode(mode.value)}
                        className={`p-2 sm:p-3 rounded-xl border-2 transition-all text-center ${
                          formData.preferredModes.includes(mode.value)
                            ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                        }`}>
                        <div className="text-xl sm:text-2xl mb-0.5">{mode.icon}</div>
                        <div className="font-bold text-xs sm:text-sm">{mode.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit"
                disabled={registerMutation.isPending || fieldValidation.name.valid === false || fieldValidation.email.valid === false || fieldValidation.phone.valid === false || fieldValidation.email.checking || fieldValidation.phone.checking}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 sm:py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 font-bold disabled:opacity-50 transition-all shadow-xl text-sm sm:text-base">
                {registerMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <LoaderIcon className="animate-spin mr-3 h-5 w-5 text-white" />Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">{t('login')}</Link>
            </p>
          </div>
        </div>
      </div>
    </DynamicBackground>
  )
}

export default Register
