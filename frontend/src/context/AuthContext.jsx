import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 🔥 CRITICAL FIX: Use sessionStorage instead of localStorage
      const token = sessionStorage.getItem('token')
      if (token) {
        const userData = await authService.getProfile()
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      sessionStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('🔑 AuthContext: Starting login process')
      console.log('🔑 AuthContext: Calling authService.login')
      
      const response = await authService.login(credentials)
      
      console.log('🔑 AuthContext: Login response received:', response)
      console.log('🔑 AuthContext: Token:', response.token ? 'exists' : 'missing')
      console.log('🔑 AuthContext: User:', response.user)
      
      // 🔥 CRITICAL FIX: Store token in sessionStorage for tab isolation
      sessionStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      
      console.log('🔑 AuthContext: Login complete, state updated')
      
      return response
    } catch (error) {
      console.error('🔑 AuthContext: Login failed:', error)
      console.error('🔑 AuthContext: Error details:', error.response?.data)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      // 🔥 CRITICAL FIX: Store token in sessionStorage for tab isolation
      sessionStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    // 🔥 CRITICAL FIX: Clear sessionStorage instead of localStorage
    sessionStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
