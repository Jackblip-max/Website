import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ProtectedRoute = ({ children, requireOrganization = false }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const currentTokenRef = useRef(null)
  const hasCheckedToken = useRef(false)

  useEffect(() => {
    // Check token on every render
    const checkToken = () => {
      const currentToken = localStorage.getItem('token')
      
      // First time - just store it
      if (!hasCheckedToken.current) {
        currentTokenRef.current = currentToken
        hasCheckedToken.current = true
        return
      }
      
      // Token changed - reload immediately
      if (currentToken !== currentTokenRef.current) {
        console.log('⚠️ Token changed! Old:', currentTokenRef.current?.slice(0, 20), 'New:', currentToken?.slice(0, 20))
        
        const shouldReload = window.confirm(
          '⚠️ Account Change Detected\n\n' +
          'You logged in with a different account in another tab. ' +
          'This page will reload to update your session.\n\n' +
          'Click OK to continue.'
        )
        
        if (shouldReload) {
          window.location.reload()
        } else {
          // Force navigate away from this page
          toast.error('You cannot use this page with a different account')
          navigate('/')
        }
      }
    }
    
    checkToken()
  }, [navigate])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Check if user should be on this page
      if (requireOrganization && !user?.organization) {
        toast.error('You need to create an organization first')
        navigate('/create-organization')
      }
    } else if (!loading && !isAuthenticated) {
      toast.error('Please log in to access this page')
      navigate('/login')
    }
  }, [loading, isAuthenticated, user, requireOrganization, navigate])

  // Show nothing while loading or checking
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Don't render if organization is required but user doesn't have one
  if (requireOrganization && !user?.organization) {
    return null
  }

  // All checks passed - render the page
  return children
}

export default ProtectedRoute
