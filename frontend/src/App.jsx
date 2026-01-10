import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

import CompleteProfile from './pages/CompleteProfile'
import VerifyEmail from './pages/VerifyEmail'
import MainLayout from './layouts/MainLayout'

// ⭐ NEW PAGES
import Landing from './pages/Landing'
import UserPortal from './pages/UserPortal'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

// Existing pages
import Home from './pages/Home'
import About from './pages/About'
import Categories from './pages/Categories'
import HowItWorks from './pages/HowItWorks'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import CreateOrganization from './pages/CreateOrganization'
import OrgDashboard from './pages/OrgDashboard'
import AddJob from './pages/AddJob'
import SavedOpportunities from './pages/SavedOpportunities'
import Applications from './pages/Applications'
import NotFound from './pages/NotFound'
import AuthCallback from './pages/AuthCallback'

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
                {/* ⭐ NEW: Landing and portals */}
                <Route path="/" element={<Landing />} />
                <Route path="/user-portal" element={<UserPortal />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* User routes - moved to /browse */}
                <Route path="/browse" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-organization" element={<CreateOrganization />} />
                <Route path="/org-dashboard" element={<OrgDashboard />} />
                <Route path="/add-job" element={<AddJob />} />
                <Route path="/saved" element={<SavedOpportunities />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                
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
