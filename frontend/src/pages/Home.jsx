import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, Filter, X, AlertCircle, Inbox, ChevronDown } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { volunteerService } from '../services/volunteerService'
import OpportunityCard from '../components/volunteer/OpportunityCard'
import Loader from '../components/common/Loader'
import DynamicBackground from '../components/common/DynamicBackground'

const Home = () => {
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const { data: opportunitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunities', filterMode, filterCategory],
    queryFn: () => {
      const params = {}
      if (filterMode !== 'all') params.mode = filterMode
      if (filterCategory !== 'all') params.category = filterCategory
      return volunteerService.getOpportunities(params)
    },
    retry: 1,
    staleTime: 30000
  })

  const opportunities = Array.isArray(opportunitiesData?.data)
    ? opportunitiesData.data
    : Array.isArray(opportunitiesData)
    ? opportunitiesData
    : []

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'environment', label: t('environment') },
    { value: 'education', label: t('education_cat') },
    { value: 'healthcare', label: t('healthcare') },
    { value: 'community', label: t('community') },
    { value: 'animals', label: t('animals') },
    { value: 'arts', label: t('arts') }
  ]

  const hasActiveFilters = filterMode !== 'all' || filterCategory !== 'all' || searchQuery

  const clearFilters = () => {
    setSearchQuery('')
    setFilterMode('all')
    setFilterCategory('all')
  }

  return (
    <DynamicBackground category="volunteer" overlay={0.6}>

      {/* ── Hero ── */}
      <div className="relative text-white py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 drop-shadow-2xl animate-fade-in leading-tight">
            {t('makeADifference')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-95 drop-shadow-lg px-2">
            {t('findOpportunities')}
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 px-4">
              <Link to="/register"
                className="bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-gray-100 font-bold transition-all shadow-2xl text-sm sm:text-base">
                Get Started — Join as Volunteer
              </Link>
              <Link to="/login"
                className="bg-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-emerald-700 font-bold transition-all border-2 border-white shadow-2xl text-sm sm:text-base">
                Login
              </Link>
            </div>
          )}

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto px-0 sm:px-4">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-3">
              {/* Search input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm sm:text-base"
                />
              </div>

              {/* Filter Toggle Button (mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm mb-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Filters */}
              <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-2`}>
                <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}
                  className="flex-1 px-3 py-2.5 sm:py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 font-medium text-sm sm:text-base border border-gray-200">
                  <option value="all">{t('allTypes')}</option>
                  <option value="onsite">{t('onsite')}</option>
                  <option value="remote">{t('remote')}</option>
                  <option value="hybrid">{t('hybrid')}</option>
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 px-3 py-2.5 sm:py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 font-medium text-sm sm:text-base border border-gray-200">
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats (authenticated) ── */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 -mt-6 sm:-mt-8 mb-8 sm:mb-12">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="p-2 sm:p-4">
                <p className="text-2xl sm:text-4xl font-bold text-emerald-600">{opportunities.length}</p>
                <p className="text-gray-700 font-medium text-xs sm:text-base">Active Opps</p>
              </div>
              <div className="p-2 sm:p-4">
                <p className="text-2xl sm:text-4xl font-bold text-blue-600">500+</p>
                <p className="text-gray-700 font-medium text-xs sm:text-base">Volunteers</p>
              </div>
              <div className="p-2 sm:p-4">
                <p className="text-2xl sm:text-4xl font-bold text-purple-600">50+</p>
                <p className="text-gray-700 font-medium text-xs sm:text-base">Orgs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">

        {/* Create org banner */}
        {isAuthenticated && !user?.organizationId && (
          <div className="mb-6 sm:mb-8 bg-blue-50/95 backdrop-blur-md border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Are you an organization?</h3>
                <p className="text-gray-700 text-sm sm:text-base">Create your profile and start posting volunteer opportunities</p>
              </div>
              <Link to="/create-organization"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 font-bold whitespace-nowrap shadow-lg text-sm sm:text-base">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('createOrg')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 items-center bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-lg shadow-lg">
            <span className="text-xs sm:text-sm text-gray-700 font-bold">Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterMode !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {t(filterMode)}
                <button onClick={() => setFilterMode('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {categories.find(c => c.value === filterCategory)?.label}
                <button onClick={() => setFilterCategory('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 underline font-medium">
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        {!isLoading && !error && opportunities.length > 0 && (
          <div className="mb-4 sm:mb-6 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-lg shadow-lg">
            <p className="text-gray-700 font-medium text-sm sm:text-base">
              <span className="font-bold text-gray-900 text-base sm:text-lg">{filteredOpportunities.length}</span>
              {' '}opportunities found
            </p>
          </div>
        )}

        {/* Grid / States */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl">
              <Loader />
            </div>
          </div>

        ) : error ? (
          <div className="text-center py-12 sm:py-16 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8">
            <AlertCircle className="w-12 sm:w-14 h-12 sm:h-14 text-red-400 mx-auto mb-4" />
            <p className="text-gray-800 text-base sm:text-lg font-bold mb-2">Could not load opportunities</p>
            <p className="text-gray-500 text-sm mb-6">There was a problem connecting to the server.</p>
            <button onClick={() => refetch()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-bold shadow-lg transition-colors text-sm sm:text-base">
              Try Again
            </button>
          </div>

        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8">
            <Inbox className="w-12 sm:w-14 h-12 sm:h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 text-lg sm:text-xl font-bold mb-2">No opportunities yet</p>
            <p className="text-gray-400 text-sm mb-6">Check back soon — new opportunities are added regularly.</p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-bold transition-colors text-sm sm:text-base">
                  Join as Volunteer
                </Link>
                <Link to="/login" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-bold transition-colors text-sm sm:text-base">
                  Login
                </Link>
              </div>
            )}
          </div>

        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8">
            <Search className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 text-base sm:text-lg mb-4 font-medium">{t('noResults')}</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline text-sm sm:text-base">
                Clear filters to see all
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id}>
                <OpportunityCard opportunity={opportunity} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CTA (guests only) ── */}
      {!isAuthenticated && (
        <div className="relative text-white py-14 sm:py-20 px-4 mt-8 sm:mt-12">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-lg">Ready to Make a Difference?</h2>
            <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-95 drop-shadow-lg">
              Join our community of volunteers and start contributing to meaningful causes
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register"
                className="bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-gray-100 font-bold transition-all shadow-2xl text-sm sm:text-base">
                Sign Up Now
              </Link>
              <Link to="/about"
                className="bg-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-emerald-800 font-bold transition-all border-2 border-white shadow-2xl text-sm sm:text-base">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
      `}</style>
    </DynamicBackground>
  )
}

export default Home
