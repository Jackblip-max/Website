import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, Loader as LoaderIcon } from 'lucide-react'
import Loader from '../components/common/Loader'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`, {
        method: 'GET'
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message)
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Failed to verify email. Please try again.')
    }
  }

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address:')
    
    if (!email) return

    setResending(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        alert('Verification email sent! Please check your inbox.')
      } else {
        alert(data.message || 'Failed to resend verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      alert('Failed to resend verification email. Please try again.')
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
              <Link
                to="/login"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Go to Login →
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-red-600 mb-6">{message}</p>
              
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
      </div>
    </div>
  )
}

export default VerifyEmail
