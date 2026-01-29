import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

// Import the new ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute'

// Layouts
import MainLayout from './layouts/MainLayout'

// Landing & Portal Pages
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

// Auth Pages
import CompleteProfile from './pages/CompleteProfile'
import VerifyEmail from './pages/VerifyEmail'
import Register from './pages/Register'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'

// User Pages
import Home from './pages/Home'
import About from './pages/About'
import Categories from './pages/Categories'
import HowItWorks from './pages/HowItWorks'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import SavedOpportunities from './pages/SavedOpportunities'
import Applications from './pages/Applications'

// Organization Pages
import CreateOrganization from './pages/CreateOrganization'
import OrgDashboard from './pages/OrgDashboard'
import EditOrganization from './pages/EditOrganization'
import AddJob from './pages/AddJob'

// Other
import NotFound from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <MainLayout>
              <Routes>
                {/* Home is now the main landing page */}
                <Route path="/" element={<Home />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Auth Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route 
                  path="/complete-profile" 
                  element={
                    <ProtectedRoute>
                      <CompleteProfile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User Routes */}
                <Route path="/browse" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Protected User Routes - Available to all authenticated users */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/saved" 
                  element={
                    <ProtectedRoute>
                      <SavedOpportunities />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/applications" 
                  element={
                    <ProtectedRoute>
                      <Applications />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Organization Routes - Only for users who have created an organization */}
                <Route 
                  path="/create-organization" 
                  element={
                    <ProtectedRoute>
                      <CreateOrganization />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/org-dashboard" 
                  element={
                    <ProtectedRoute requireOrganization>
                      <OrgDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/org/edit" 
                  element={
                    <ProtectedRoute requireOrganization>
                      <EditOrganization />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/add-job" 
                  element={
                    <ProtectedRoute requireOrganization>
                      <AddJob />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </Router>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default App
