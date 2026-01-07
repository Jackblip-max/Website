import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, Loader as LoaderIcon, AlertCircle, Clock } from 'lucide-react'
import Loader from '../components/common/Loader'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided. Please check your email for the correct verification link.')
      return
    }

    console.log('Starting email verification with token:', token)
    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      console.log('Calling verification API...')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Verification response status:', response.status)
      const data = await response.json()
      console.log('Verification response data:', data)

      // Check if response is successful (200 status) OR if data.success is true
      if (response.ok || data.success) {
        // Check if message indicates already verified
        if (data.message?.toLowerCase().includes('already verified')) {
          setStatus('already_verified')
          setMessage(data.message || 'Your email has already been verified. You can login now!')
        } else {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully! You can now login.')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
      } else {
        // Check specific error types
        if (data.expired) {
          setStatus('expired')
          setMessage(data.message || 'Verification link has expired. Please request a new one.')
        } else if (data.message?.toLowerCase().includes('already been used')) {
          // Token was already used - treat as already verified
          setStatus('already_verified')
          setMessage('This verification link has already been used. Your email is verified!')
        } else if (data.message?.toLowerCase().includes('invalid') || data.message?.toLowerCase().includes('not found')) {
          setStatus('error')
          setMessage(data.message || 'Invalid verification token.')
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Failed to verify email. Please try again or contact support.')
    }
  }

  const handleResendVerification = async () => {
    let email = userEmail

    if (!email) {
      email = prompt('Please enter your email address:')
      if (!email) return
      setUserEmail(email)
    }

    setResending(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Verification Email Sent!\n\nWe\'ve sent a new verification email to: ' + email + '\n\nPlease check your inbox and click the verification link.\n\nNote: Check your spam folder if you don\'t see the email.')
      } else {
        alert('❌ ' + (data.message || 'Failed to resend verification email. Please try again.'))
      }
    } catch (error) {
      console.error('Resend error:', error)
      alert('❌ Failed to resend verification email. Please try again or contact support.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="mb-4">
                <LoaderIcon className="w-16 h-16 text-emerald-600 mx-auto animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified! ✅</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium">Your account is now active!</p>
                <p className="text-green-700 text-sm mt-1">You can now login and start volunteering.</p>
              </div>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
              <Link
                to="/login"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Go to Login →
              </Link>
            </>
          )}

          {status === 'already_verified' && (
            <>
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-blue-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Verified ✓</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium">✓ Your email is verified</p>
                <p className="text-blue-700 text-sm mt-1">You can proceed to login to your account.</p>
              </div>
              
              <Link
                to="/login"
                className="w-full inline-block bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium text-center"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="mb-4">
                <Clock className="w-16 h-16 text-orange-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Link Expired</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 font-medium">⏰ Your verification link has expired</p>
                <p className="text-orange-700 text-sm mt-1">Verification links are valid for 24 hours.</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Request New Verification Email
                    </>
                  )}
                </button>
                
                <Link
                  to="/login"
                  className="block text-emerald-600 hover:text-emerald-700 font-medium text-center"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-red-600 mb-4">{message}</p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-red-800 font-medium">Common Issues:</p>
                    <ul className="text-red-700 text-sm mt-2 space-y-1">
                      <li>• The verification link may have expired (24hr limit)</li>
                      <li>• The link may have already been used</li>
                      <li>• The link may be incomplete - check your email again</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
                
                <Link
                  to="/register"
                  className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium text-center"
                >
                  Register New Account
                </Link>
                
                <Link
                  to="/"
                  className="block text-emerald-600 hover:text-emerald-700 font-medium text-center"
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs text-left">
            <p className="font-semibold mb-2">Debug Info:</p>
            <p>Status: {status}</p>
            <p>Token: {searchParams.get('token')?.substring(0, 20)}...</p>
            <p>API URL: {import.meta.env.VITE_API_URL}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
