import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [validatingEmail, setValidatingEmail] = useState(false)

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🔐 Attempting login with:', { email: data.email, password: '***' })
      console.log('🔐 Login function:', typeof login)
      
      try {
        const result = await login(data)
        console.log('🔐 Login function returned:', result)
        return result
      } catch (error) {
        console.error('🔐 Login function threw error:', error)
        throw error
      }
    },
    onSuccess: async (response) => {
      console.log('✅ Login successful - Response:', response)
      console.log('✅ User data:', response?.user)
      console.log('✅ Token:', response?.token ? 'Token received' : 'No token')
      
      toast.success('Login successful!')
      
      // Add a small delay so we can see the console
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      navigate('/')
    },
    onError: (error) => {
      console.error('❌ Login error FULL:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error response data:', error.response?.data)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateEmailExistence = async (email) => {
    try {
      setValidatingEmail(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })

      const data = await response.json()
      return data.valid
    } catch (error) {
      console.error('Email validation error:', error)
      // If validation fails, allow login attempt anyway
      return true
    } finally {
      setValidatingEmail(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('📝 Form submitted')
    console.log('📝 Form data:', { email: formData.email, password: '***' })
    console.log('📝 Mutation status before:', loginMutation.status)
    
    // Basic validation
    if (!formData.email || !formData.password) {
      console.log('⚠️ Validation failed: Missing fields')
      toast.error('Please fill in all fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Check if email exists (for better UX)
    const loadingToast = toast.loading('Checking your account...')
    
    const emailExists = await validateEmailExistence(formData.email)
    
    toast.dismiss(loadingToast)

    if (!emailExists) {
      toast.error("Couldn't find your Google Account. Please check your email address.", {
        duration: 5000
      })
      
      alert(
        '❌ Account Not Found\n\n' +
        "We couldn't find an account with this email address.\n\n" +
        'Please check:\n' +
        '• Your email address is spelled correctly\n' +
        '• You have registered with this email\n' +
        '• Your Google account exists\n\n' +
        'If you haven\'t registered yet, please sign up first.'
      )
      
      document.querySelector('input[name="email"]')?.focus()
      return
    }

    console.log('🚀 Calling login mutation...')
    
    try {
      await loginMutation.mutateAsync(formData)
      console.log('📝 Mutation completed successfully')
    } catch (error) {
      console.log('📝 Mutation failed:', error.message)
    }
  }

  const handleGoogleLogin = () => {
    // Get the full backend URL
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    console.log('🔗 Redirecting to Google OAuth:', `${backendUrl}/api/auth/google`)
    window.location.href = `${backendUrl}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('login')}</h2>
        
        {/* Google Login Button */}
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

        {/* OR Divider */}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || validatingEmail}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {validatingEmail ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </span>
            ) : loginMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : t('login')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
