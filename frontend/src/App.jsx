import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

import CompleteProfile from './pages/CompleteProfile'
import MainLayout from './layouts/MainLayout'
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
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-organization" element={<CreateOrganization />} />
                <Route path="/org-dashboard" element={<OrgDashboard />} />
                <Route path="/add-job" element={<AddJob />} />
                <Route path="/saved" element={<SavedOpportunities />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
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
