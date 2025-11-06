import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center font-bold">
                MV
              </div>
              <span className="text-xl font-bold">MyanVolunteer</span>
            </div>
            <p className="text-gray-400 text-sm">{t('tagline')}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm">{t('home')}</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">{t('about')}</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white text-sm">{t('categories')}</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white text-sm">{t('howItWorks')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Volunteers</h3>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-gray-400 hover:text-white text-sm">Sign Up</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Find Opportunities</Link></li>
              <li><Link to="/saved" className="text-gray-400 hover:text-white text-sm">Saved Jobs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Organizations</h3>
            <ul className="space-y-2">
              <li><Link to="/create-organization" className="text-gray-400 hover:text-white text-sm">Create Organization</Link></li>
              <li><Link to="/org-dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm">{t('contact')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 MyanVolunteer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer