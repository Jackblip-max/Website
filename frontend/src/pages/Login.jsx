import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import DynamicBackground from '../components/common/DynamicBackground'

const Login = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🔐 Attempting login with:', { email: data.email, password: '***' })
      
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
      
      toast.success('Login successful!')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to browse page
      navigate('/browse')
    },
    onError: (error) => {
      console.error('❌ Login error FULL:', error)
      
      const errorData = error.response?.data
      const message = errorData?.message || error.message || 'Login failed'
      
      // Check if it's a verification error
      if (errorData?.needsVerification || error.response?.status === 403) {
        toast((toastInstance) => (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Email Not Verified</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                toast.dismiss(toastInstance.id)
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: errorData?.email || formData.email })
                  })
                  const data = await response.json()
                  if (data.success) {
                    toast.success('✅ Verification email sent! Please check your inbox.')
                  } else {
                    toast.error(data.message || 'Failed to resend verification email')
                  }
                } catch (err) {
                  console.error('Resend verification error:', err)
                  toast.error('Failed to resend verification email')
                }
              }}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors"
            >
              📧 Resend Verification Email
            </button>
          </div>
        ), {
          duration: 8000,
          style: {
            minWidth: '400px',
            maxWidth: '500px',
          },
        })
      } else {
        toast.error(message)
      }
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('📝 Form submitted')
    
    if (!formData.email || !formData.password) {
      console.log('⚠️ Validation failed: Missing fields')
      toast.error('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
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
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    console.log('🔗 Redirecting to Google OAuth:', `${backendUrl}/api/auth/google`)
    window.location.href = `${backendUrl}/api/auth/google`
  }

  return (
    <DynamicBackground category="minimal" overlay={0.8}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        {/* Back Button */}
        <Link 
          to="/"
          className="absolute top-8 left-8 inline-flex items-center text-white hover:text-emerald-200 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl transform hover:rotate-12 transition-transform">
              MV
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('login')}</h2>
            <p className="text-gray-600 font-medium">Welcome back! Sign in to continue</p>
          </div>
          
          {/* Google Login Button */}
          <div className="mb-6">
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 rounded-xl py-4 hover:bg-gray-50 transition-all hover:shadow-xl transform hover:scale-[1.02]"
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

          {/* OR Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-bold">OR</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  required
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-xl"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : t('login')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
              {t('register')}
            </Link>
          </p>

          {/* Email Verification Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <span className="font-semibold">📧 Note:</span> You must verify your email before logging in. Check your inbox after registration.
            </p>
          </div>
        </div>
      </div>
    </DynamicBackground>
  )
}

export default Login
