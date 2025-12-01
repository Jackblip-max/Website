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
      const token = localStorage.getItem('token')
      if (token) {
        const userData = await authService.getProfile()
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
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
      
      localStorage.setItem('token', response.token)
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
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
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
