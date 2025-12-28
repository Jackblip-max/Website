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

  // ... (Keep all your existing validation functions)

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
    // ... (Keep your validation logic)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // ... (Keep your validation logic)
    registerMutation.mutate(formData)
  }

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    window.location.href = `${backendUrl}/api/auth/google`
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
            {/* Keep all your existing form fields */}
            {/* Just make sure inputs have nice styling */}
            
            <button
              type="submit"
              disabled={registerMutation.isPending || validatingEmail || checkingEmail || emailExists === false}
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
