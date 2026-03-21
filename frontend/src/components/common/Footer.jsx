import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()

  return (
    <footer className="relative z-50 bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <img
                src="/logo.png"
                alt="MyanVolunteer"
                className="w-9 h-9 rounded-full object-contain flex-shrink-0"
              />
              <span className="text-lg font-bold">MyanVolunteer</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t('tagline')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-300">Quick Links</h3>
            <ul className="space-y-2">
              {[
                ['/', t('home')],
                ['/about', t('about')],
                ['/categories', t('categories')],
                ['/how-it-works', t('howItWorks')]
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Volunteers */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-300">Volunteers</h3>
            <ul className="space-y-2">
              {[
                ['/register', 'Sign Up'],
                ['/', 'Find Opportunities'],
                ['/saved', 'Saved Jobs']
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organizations */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-300">Organizations</h3>
            <ul className="space-y-2">
              {[
                ['/create-organization', 'Create Org'],
                ['/org-dashboard', 'Dashboard'],
                ['/contact', t('contact')]
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} MyanVolunteer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
