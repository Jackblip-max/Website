import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff, CheckCircle, XCircle, Loader as LoaderIcon } from 'lucide-react'
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
    education: 'undergraduate'
  })
  const [errors, setErrors] = useState({})
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [checkingName, setCheckingName] = useState(false)
  const [checkingPhone, setCheckingPhone] = useState(false)
  const [validatingEmail, setValidatingEmail] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [emailExists, setEmailExists] = useState(null)
  const [nameAvailable, setNameAvailable] = useState(null)
  const [phoneAvailable, setPhoneAvailable] = useState(null)

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

  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null)
      return
    }

    setCheckingEmail(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setEmailAvailable(data.available)
    } catch (error) {
      console.error('Email check error:', error)
    } finally {
      setCheckingEmail(false)
    }
  }

  const validateEmailExistence = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExists(null)
      return
    }

    setValidatingEmail(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setEmailExists(data.valid)
    } catch (error) {
      console.error('Email validation error:', error)
      setEmailExists(null)
    } finally {
      setValidatingEmail(false)
    }
  }

  const checkNameAvailability = async (name) => {
    if (!name || name.length < 2) {
      setNameAvailable(null)
      return
    }

    setCheckingName(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await response.json()
      setNameAvailable(data.available)
    } catch (error) {
      console.error('Name check error:', error)
    } finally {
      setCheckingName(false)
    }
  }

  const checkPhoneAvailability = async (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    if (!cleanPhone || !/^(\+?95|0?9)\d{7,10}$/.test(cleanPhone)) {
      setPhoneAvailable(null)
      return
    }

    setCheckingPhone(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      })
      const data = await response.json()
      setPhoneAvailable(data.available)
    } catch (error) {
      console.error('Phone check error:', error)
    } finally {
      setCheckingPhone(false)
    }
  }

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
    setErrors(prev => ({ ...prev, [name]: '' }))

    if (name === 'password') {
      setPasswordStrength(validatePassword(value))
    }

    if (name === 'email') {
      const debounceTimer = setTimeout(() => {
        checkEmailAvailability(value)
        validateEmailExistence(value)
      }, 500)
      return () => clearTimeout(debounceTimer)
    }

    if (name === 'name') {
      const debounceTimer = setTimeout(() => {
        checkNameAvailability(value)
      }, 500)
      return () => clearTimeout(debounceTimer)
    }

    if (name === 'phone') {
      const debounceTimer = setTimeout(() => {
        checkPhoneAvailability(value)
      }, 500)
      return () => clearTimeout(debounceTimer)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = {}
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (emailAvailable === false) {
      newErrors.email = 'This email is already registered'
    }
    
    if (emailExists === false) {
      newErrors.email = 'This email address does not exist'
    }
    
    if (nameAvailable === false) {
      newErrors.name = 'This name is already taken'
    }
    
    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '')
    if (!cleanPhone || !/^(\+?95|0?9)\d{7,10}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid Myanmar phone number'
    }
    
    if (phoneAvailable === false) {
      newErrors.phone = 'This phone number is already registered'
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (passwordStrength === 'weak') {
      newErrors.password = 'Password is too weak. Add uppercase, lowercase, numbers, and special characters'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      registerMutation.mutate(formData)
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    window.location.href = `${backendUrl}/api/auth/google`
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
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl">
              MV
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('registerTitle')}</h2>
            <p className="text-gray-600 font-medium">Create your account to start volunteering</p>
          </div>
          
          {/* Google Sign Up */}
          <div className="mb-6">
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 rounded-xl py-4 hover:bg-gray-50 transition-all hover:shadow-md"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-bold text-gray-700">{t('googleLogin')}</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-bold">OR</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium ${
                    errors.name ? 'border-red-500' : nameAvailable === true ? 'border-green-500' : nameAvailable === false ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {checkingName && (
                  <LoaderIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!checkingName && nameAvailable === true && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {!checkingName && nameAvailable === false && (
                  <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              {nameAvailable === false && <p className="text-red-500 text-xs mt-1">This name is already taken</p>}
              {nameAvailable === true && <p className="text-green-500 text-xs mt-1">Name is available</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium ${
                    errors.email ? 'border-red-500' : emailAvailable === true && emailExists === true ? 'border-green-500' : emailAvailable === false || emailExists === false ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {(checkingEmail || validatingEmail) && (
                  <LoaderIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!checkingEmail && !validatingEmail && emailAvailable === true && emailExists === true && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {!checkingEmail && !validatingEmail && (emailAvailable === false || emailExists === false) && (
                  <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              {emailAvailable === false && <p className="text-red-500 text-xs mt-1">This email is already registered</p>}
              {emailExists === false && <p className="text-red-500 text-xs mt-1">This email address does not exist</p>}
              {emailAvailable === true && emailExists === true && <p className="text-green-500 text-xs mt-1">Email is valid and available</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+95 9xxxxxxxxx or 09xxxxxxxxx"
                  className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium ${
                    errors.phone ? 'border-red-500' : phoneAvailable === true ? 'border-green-500' : phoneAvailable === false ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {checkingPhone && (
                  <LoaderIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!checkingPhone && phoneAvailable === true && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {!checkingPhone && phoneAvailable === false && (
                  <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              {phoneAvailable === false && <p className="text-red-500 text-xs mt-1">This phone number is already registered</p>}
              {phoneAvailable === true && <p className="text-green-500 text-xs mt-1">Phone number is available</p>}
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
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex="-1"
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
                  <p className="text-xs text-gray-500">Use uppercase, lowercase, numbers & special characters</p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending || validatingEmail || checkingEmail || emailExists === false || emailAvailable === false || nameAvailable === false || phoneAvailable === false}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-xl"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Creating account...
                </span>
              ) : t('submit')}
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
