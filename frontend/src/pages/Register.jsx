import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
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
  const [emailAvailable, setEmailAvailable] = useState(null)
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
    
    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(trimmedName)) {
      return 'Name cannot have multiple consecutive spaces'
    }
    
    // Check if name starts or ends with space
    if (name !== trimmedName) {
      return 'Name cannot start or end with spaces'
    }
    
    return null
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
            delete newErrors.email
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

    // Password validation - ENHANCED
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else {
      // Check password strength
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
      toast.success(response.message || 'Registration successful! Please check your email to verify your account.', {
        duration: 6000
      })
      // Show detailed alert about email verification
      alert(
        '✅ Registration Successful!\n\n' +
        '📧 Verification Email Sent\n\n' +
        'We have sent a verification email to: ' + formData.email + '\n\n' +
        'Please follow these steps:\n' +
        '1. Check your email inbox\n' +
        '2. Look for an email from MyanVolunteer\n' +
        '3. Click the verification link in the email\n' +
        '4. Return here to login\n\n' +
        '⚠️ Important:\n' +
        '- Check your spam/junk folder if you don\'t see the email\n' +
        '- The verification link expires in 24 hours\n' +
        '- You must verify your email before you can login'
      )
      navigate('/login')
    },
    onError: (error) => {
      console.error('Registration error:', error)
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      
      // Show specific error if email sending failed
      if (message.includes('verification email')) {
        toast.error(
          'Failed to send verification email. Please check your email address is correct and try again.',
          { duration: 6000 }
        )
        alert(
          '❌ Email Verification Failed\n\n' +
          'We could not send a verification email to: ' + formData.email + '\n\n' +
          'Possible reasons:\n' +
          '- The email address may not exist\n' +
          '- The email address may be incorrect\n' +
          '- Email server is temporarily unavailable\n\n' +
          'Please check your email address and try again.'
        )
      } else {
        toast.error(message)
      }
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Real-time name validation
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
        // Check name availability when user finishes typing
        clearTimeout(window.nameCheckTimeout)
        window.nameCheckTimeout = setTimeout(() => {
          checkNameAvailability(value)
        }, 800)
      }
    }
    
    // Check email availability when user finishes typing
    if (name === 'email') {
      setEmailAvailable(null)
      clearTimeout(window.emailCheckTimeout)
      window.emailCheckTimeout = setTimeout(() => {
        checkEmailAvailability(value)
      }, 800)
    }

    // Check phone availability when user finishes typing
    if (name === 'phone') {
      setPhoneAvailable(null)
      clearTimeout(window.phoneCheckTimeout)
      window.phoneCheckTimeout = setTimeout(() => {
        checkPhoneAvailability(value)
      }, 800)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    // Show loading toast
    const loadingToast = toast.loading('Validating your email address...')

    // Validate email existence first
    fetch(`${import.meta.env.VITE_API_URL}/auth/validate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
    })
      .then(response => response.json())
      .then(data => {
        toast.dismiss(loadingToast)
        
        if (!data.valid) {
          // Email doesn't exist or is invalid
          const message = data.message || "Couldn't find your Google Account"
          
          toast.error(message, { duration: 5000 })
          
          // Show detailed alert
          alert(
            '❌ Email Validation Failed\n\n' +
            message + '\n\n' +
            'Please check:\n' +
            '• Your email address is spelled correctly\n' +
            '• Your Google account exists\n' +
            '• You have access to this email address\n\n' +
            'For Gmail accounts:\n' +
            '• Username must be 6-30 characters\n' +
            '• Cannot start or end with a period (.)\n' +
            '• Cannot have consecutive periods (..)'
          )
          
          // Focus on email input
          document.querySelector('input[name="email"]')?.focus()
          return
        }
        
        // Email is valid, proceed with registration
        console.log('✅ Email validated, proceeding with registration:', formData.email)
        registerMutation.mutate(formData)
      })
      .catch(error => {
        toast.dismiss(loadingToast)
        console.error('Email validation error:', error)
        
        // If validation service fails, show warning but allow registration
        const proceed = window.confirm(
          '⚠️ Unable to validate email address\n\n' +
          'We couldn\'t verify your email address at this time.\n\n' +
          'Do you want to proceed with registration anyway?\n\n' +
          'Note: You will need access to this email to verify your account.'
        )
        
        if (proceed) {
          registerMutation.mutate(formData)
        }
      })
  }

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
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
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {nameAvailable === true && !checkingName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            {nameAvailable === true && !errors.name && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Name is available
              </p>
            )}
          </div>

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
                  errors.email ? 'border-red-500' : emailAvailable === true ? 'border-green-500' : 'border-gray-300'
                }`}
                required
              />
              {checkingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {emailAvailable === true && !checkingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
                {errors.email === 'This email is already registered' && (
                  <> <Link to="/login" className="underline">Login instead?</Link></>
                )}
              </p>
            )}
            {emailAvailable === true && !errors.email && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Email is available
              </p>
            )}
          </div>

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
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {phoneAvailable === true && !checkingPhone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            {phoneAvailable === true && !errors.phone && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Phone number is available
              </p>
            )}
            {!errors.phone && !phoneAvailable && <p className="text-xs text-gray-500 mt-1">Myanmar phone number format</p>}
          </div>

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
                placeholder="At least 6 characters"
                className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
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
