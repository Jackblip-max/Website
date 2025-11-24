import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkAuth } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')
        const needsProfile = searchParams.get('needsProfile') === 'true'
        const errorParam = searchParams.get('error')

        if (errorParam) {
          setError('Authentication failed. Please try again.')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        if (token) {
          // Store the token
          localStorage.setItem('token', token)
          
          // Refresh auth state
          await checkAuth()
          
          // Redirect based on profile completion status
          if (needsProfile) {
            navigate('/complete-profile')
          } else {
            navigate('/')
          }
        } else {
          setError('No authentication token received')
          setTimeout(() => navigate('/login'), 2000)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('An error occurred during authentication')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, checkAuth])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader />
        <p className="text-gray-600 mt-4">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallback
