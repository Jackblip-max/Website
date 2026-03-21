import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Globe, User, ChevronDown, Bookmark, Clock, Building2, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { currentLanguage, toggleLanguage, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const hideHeader = location.pathname.startsWith('/admin')
  if (hideHeader) return null

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  const closeAll = () => {
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const navLinks = [
    ['/', t('home')],
    ['/about', t('about')],
    ['/categories', t('categories')],
    ['/how-it-works', t('howItWorks')],
  ]

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" onClick={closeAll} className="flex items-center space-x-2 flex-shrink-0">
            <img
              src="/logo.png"
              alt="MyanVolunteer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">MyanVolunteer</h1>
              <p className="text-xs text-gray-500 hidden lg:block truncate max-w-[180px]">{t('tagline')}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-1 justify-center space-x-8 xl:space-x-12">
            {navLinks.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className={`font-medium text-base transition-colors hover:text-emerald-600 ${
                  location.pathname === to ? 'text-emerald-600' : 'text-gray-700'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-semibold">{currentLanguage === 'en' ? 'MY' : 'EN'}</span>
            </button>

            {/* Auth Buttons / Profile */}
            {!isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-medium px-4 py-2 rounded-lg transition-all text-sm"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                >
                  {t('register')}
                </Link>
              </div>
            ) : (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setMenuOpen(false) }}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <span className="hidden md:block font-medium text-sm truncate max-w-[100px]">{user?.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {[
                      { to: '/profile', icon: <User className="w-4 h-4" />, label: t('myProfile') },
                      ...(user?.organization ? [{ to: '/org-dashboard', icon: <Building2 className="w-4 h-4" />, label: t('myOrganization') }] : []),
                      { to: '/saved', icon: <Bookmark className="w-4 h-4" />, label: t('savedTasks') },
                      { to: '/applications', icon: <Clock className="w-4 h-4" />, label: t('applications') },
                    ].map(({ to, icon, label }) => (
                      <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm transition-colors">
                        {icon}<span>{label}</span>
                      </Link>
                    ))}

                    <button onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors">
                      <LogOut className="w-4 h-4" /><span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => { setMenuOpen(!menuOpen); setProfileOpen(false) }}
              className="lg:hidden p-2 text-gray-700 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(([to, label]) => (
              <Link key={to} to={to} onClick={closeAll}
                className={`block py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                  location.pathname === to
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile Auth / Profile */}
          {!isAuthenticated ? (
            <div className="px-4 py-3 border-t border-gray-100 flex flex-col space-y-2">
              <Link to="/login" onClick={closeAll}
                className="w-full text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-lg font-semibold text-sm">
                {t('login')}
              </Link>
              <Link to="/register" onClick={closeAll}
                className="w-full text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">
                {t('register')}
              </Link>
            </div>
          ) : (
            <div className="border-t border-gray-100">
              <div className="px-4 py-3 bg-gray-50 flex items-center space-x-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="px-4 py-2 space-y-1">
                {[
                  { to: '/profile', icon: <User className="w-4 h-4" />, label: t('myProfile') },
                  ...(user?.organization ? [{ to: '/org-dashboard', icon: <Building2 className="w-4 h-4" />, label: t('myOrganization') }] : []),
                  { to: '/saved', icon: <Bookmark className="w-4 h-4" />, label: t('savedTasks') },
                  { to: '/applications', icon: <Clock className="w-4 h-4" />, label: t('applications') },
                ].map(({ to, icon, label }) => (
                  <Link key={to} to={to} onClick={closeAll}
                    className="flex items-center space-x-3 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors">
                    {icon}<span>{label}</span>
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 text-sm transition-colors">
                  <LogOut className="w-4 h-4" /><span>{t('logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdowns */}
      {(menuOpen || profileOpen) && (
        <div className="fixed inset-0 z-[-1]" onClick={closeAll} />
      )}
    </header>
  )
}

export default Header
