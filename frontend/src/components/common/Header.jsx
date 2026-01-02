import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Globe, User, ChevronDown, Bell, Bookmark, Clock, Building2, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

const Header = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { currentLanguage, toggleLanguage, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                MV
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">MyanVolunteer</h1>
                <p className="text-xs text-gray-600">{t('tagline')}</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-emerald-600 font-medium">{t('home')}</Link>
              <Link to="/about" className="text-gray-700 hover:text-emerald-600 font-medium">{t('about')}</Link>
              <Link to="/categories" className="text-gray-700 hover:text-emerald-600 font-medium">{t('categories')}</Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-emerald-600 font-medium">{t('howItWorks')}</Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">{currentLanguage === 'en' ? 'MY' : 'EN'}</span>
            </button>

            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium px-4 py-2"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium"
                >
                  {t('register')}
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="hidden md:block font-medium">{user?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>{t('myProfile')}</span>
                    </Link>

                    {user?.organizationId && (
                      <Link 
                        to="/org-dashboard" 
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>{t('myOrganization')}</span>
                      </Link>
                    )}

                    <Link 
                      to="/saved" 
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>{t('savedTasks')}</span>
                    </Link>

                    <Link 
                      to="/applications" 
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{t('applications')}</span>
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden text-gray-700"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-2">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-emerald-600"
              onClick={() => setMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link 
              to="/about" 
              className="block py-2 text-gray-700 hover:text-emerald-600"
              onClick={() => setMenuOpen(false)}
            >
              {t('about')}
            </Link>
            <Link 
              to="/categories" 
              className="block py-2 text-gray-700 hover:text-emerald-600"
              onClick={() => setMenuOpen(false)}
            >
              {t('categories')}
            </Link>
            <Link 
              to="/how-it-works" 
              className="block py-2 text-gray-700 hover:text-emerald-600"
              onClick={() => setMenuOpen(false)}
            >
              {t('howItWorks')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
