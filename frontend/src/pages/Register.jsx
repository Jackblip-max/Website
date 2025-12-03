import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

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

  const validateName = (name) => {
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      return 'Name is required'
    }
    
    if (trimmedName.length < 2) {
      return 'Name must be at least 2 characters'
    }
    
    if (trimmedName.length > 50) {
      return 'Name must be less than 50 characters'
    }
    
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return 'Name can only contain letters and spaces'
    }
    
    if (/\s{2,}/.test(trimmedName)) {
      return 'Name cannot have multiple consecutive spaces'
    }
    
    if (name !== trimmedName) {
      return 'Name cannot start or end with spaces'
    }
    
    return null
  }

  const validateEmailExistence = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return
    }

    setValidatingEmail(true)
    setEmailExists(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })

      const data = await response.json()
      
      if (!data.valid) {
        setEmailExists(false)
        setErrors(prev => ({ 
          ...prev, 
          email: data.message || "This email address doesn't exist or cannot receive messages"
        }))
      } else {
        setEmailExists(true)
        // Clear email existence error, but keep checking availability
        setErrors(prev => {
          const newErrors = { ...prev }
          if (newErrors.email?.includes("doesn't exist") || newErrors.email?.includes("cannot receive")) {
            delete newErrors.email
          }
          return newErrors
        })
      }
    } catch (error) {
      console.error('Email validation error:', error)
      setEmailExists(null)
    } finally {
      setValidatingEmail(false)
    }
  }

  const checkNameAvailability = async (name) => {
    if (!name || name.trim().length < 2) {
      return
    }

    setCheckingName(true)
    setNameAvailable(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await response.json()
      
      if (data.success) {
        setNameAvailable(data.available)
        if (!data.available) {
          setErrors(prev => ({ ...prev, name: 'This name is already taken' }))
        } else {
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.name
            return newErrors
          })
        }
      }
    } catch (error) {
      console.error('Name check error:', error)
    } finally {
      setCheckingName(false)
    }
  }

  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return
    }

    setCheckingEmail(true)
    setEmailAvailable(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })

      const data = await response.json()
      
      if (data.success) {
        setEmailAvailable(data.available)
        if (!data.available) {
          setErrors(prev => ({ ...prev, email: 'This email is already registered' }))
        } else {
          setErrors(prev => {
            const newErrors = { ...prev }
            if (newErrors.email === 'This email is already registered') {
              delete newErrors.email
            }
            return newErrors
          })
        }
      }
    } catch (error) {
      console.error('Email check error:', error)
    } finally {
      setCheckingEmail(false)
    }
  }

  const checkPhoneAvailability = async (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    if (!cleanPhone || !/^(\+?95|09)\d{7,10}$/.test(cleanPhone)) {
      return
    }

    setCheckingPhone(true)
    setPhoneAvailable(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanPhone })
      })

      const data = await response.json()
      
      if (data.success) {
        setPhoneAvailable(data.available)
        if (!data.available) {
          setErrors(prev => ({ ...prev, phone: 'This phone number is already registered' }))
        } else {
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.phone
            return newErrors
          })
        }
      }
    } catch (error) {
      console.error('Phone check error:', error)
    } finally {
      setCheckingPhone(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    const nameError = validateName(formData.name)
    if (nameError) {
      newErrors.name = nameError
    } else if (nameAvailable === false) {
      newErrors.name = 'This name is already taken'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (emailExists === false) {
      newErrors.email = "This email address doesn't exist or cannot receive messages"
    } else if (emailAvailable === false) {
      newErrors.email = 'This email is already registered'
    }

    // Phone validation
    const cleanPhone = formData.phone.replace(/\s/g, '')
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(\+?95|09)\d{7,10}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid Myanmar phone number (e.g., 09xxxxxxxxx)'
    } else if (phoneAvailable === false) {
      newErrors.phone = 'This phone number is already registered'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password)
      const hasLowerCase = /[a-z]/.test(formData.password)
      const hasNumbers = /\d/.test(formData.password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
      
      if (!hasUpperCase || !hasLowerCase) {
        newErrors.password = 'Password must contain both uppercase and lowercase letters'
      } else if (!hasNumbers) {
        newErrors.password = 'Password must contain at least one number'
      } else if (!hasSpecialChar) {
        newErrors.password = 'Password must contain at least one special character (!@#$%^&*...)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    if (name === 'password') {
      checkPasswordStrength(value)
    }
    
    if (name === 'name') {
      const nameError = validateName(value)
      if (nameError) {
        setErrors(prev => ({ ...prev, name: nameError }))
        setNameAvailable(null)
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.name
          return newErrors
        })
        clearTimeout(window.nameCheckTimeout)
        window.nameCheckTimeout = setTimeout(() => {
          checkNameAvailability(value)
        }, 800)
      }
    }
    
    if (name === 'email') {
      setEmailAvailable(null)
      setEmailExists(null)
      
      // Clear previous timeouts
      clearTimeout(window.emailExistenceTimeout)
      clearTimeout(window.emailCheckTimeout)
      
      // First check email existence, then availability
      window.emailExistenceTimeout = setTimeout(() => {
        validateEmailExistence(value).then(() => {
          // Only check availability if email exists
          if (emailExists !== false) {
            checkEmailAvailability(value)
          }
        })
      }, 1000)
    }

    if (name === 'phone') {
      setPhoneAvailable(null)
      clearTimeout(window.phoneCheckTimeout)
      window.phoneCheckTimeout = setTimeout(() => {
        checkPhoneAvailability(value)
      }, 800)
    }
  }

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('')
      return
    }

    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    strength = Object.values(checks).filter(Boolean).length

    if (strength <= 2) {
      setPasswordStrength('weak')
    } else if (strength === 3 || strength === 4) {
      setPasswordStrength('medium')
    } else {
      setPasswordStrength('strong')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', { duration: 3000 })
      return
    }

    // Final check: ensure email exists
    if (emailExists === false) {
      toast.error("Cannot register with an email that doesn't exist", { duration: 4000 })
      return
    }

    console.log('Submitting registration:', { ...formData, password: '***' })
    registerMutation.mutate(formData)
  }

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    window.location.href = `${backendUrl}/api/auth/google`
  }

  const getEmailStatusIcon = () => {
    if (validatingEmail || checkingEmail) {
      return <Loader className="w-5 h-5 text-gray-400 animate-spin" />
    }
    if (emailExists === false) {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    if (emailAvailable === false) {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    if (emailExists === true && emailAvailable === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return null
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
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : nameAvailable === true ? 'border-green-500' : 'border-gray-300'
                }`}
                required
              />
              {checkingName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              )}
              {nameAvailable === true && !checkingName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            {nameAvailable === true && !errors.name && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Name is available
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : (emailExists === true && emailAvailable === true) ? 'border-green-500' : 'border-gray-300'
                }`}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getEmailStatusIcon()}
              </div>
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <XCircle className="w-3 h-3 mr-1" />
                {errors.email}
                {errors.email === 'This email is already registered' && (
                  <> <Link to="/login" className="underline ml-1">Login instead?</Link></>
                )}
              </p>
            )}
            {emailExists === true && emailAvailable === true && !errors.email && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Email is valid and available
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('phone')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxxx or +959xxxxxxxxx"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : phoneAvailable === true ? 'border-green-500' : 'border-gray-300'
                }`}
                required
              />
              {checkingPhone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              )}
              {phoneAvailable === true && !checkingPhone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            {phoneAvailable === true && !errors.phone && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Phone number is available
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters with uppercase, lowercase, number & special character"
                className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            
            {formData.password && !errors.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                        passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                        passwordStrength === 'strong' ? 'w-full bg-green-500' : 'w-0'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                    passwordStrength === 'strong' ? 'text-green-600' : ''
                  }`}>
                    {passwordStrength === 'weak' ? 'Weak' :
                     passwordStrength === 'medium' ? 'Medium' :
                     passwordStrength === 'strong' ? 'Strong' : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Password must contain: uppercase, lowercase, number & special character
                </p>
              </div>
            )}
          </div>

          {/* Education Field */}
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

          <button
            type="submit"
            disabled={registerMutation.isPending || validatingEmail || checkingEmail || emailExists === false}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
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
