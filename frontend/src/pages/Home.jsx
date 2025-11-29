import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, Filter, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { volunteerService } from '../services/volunteerService'
import OpportunityCard from '../components/volunteer/OpportunityCard'
import Loader from '../components/common/Loader'

const Home = () => {
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const { data: opportunitiesData, isLoading, error } = useQuery({
    queryKey: ['opportunities', filterMode, filterCategory],
    queryFn: () => {
      const params = {}
      if (filterMode !== 'all') params.mode = filterMode
      if (filterCategory !== 'all') params.category = filterCategory
      return volunteerService.getOpportunities(params)
    },
    retry: 2,
    staleTime: 30000
  })

  // Extract array from response
  const opportunities = Array.isArray(opportunitiesData?.data) ? opportunitiesData.data : []

  // Filter by search query
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('makeADifference')}
          </h1>
          <p className="text-xl mb-8 opacity-90">
            {t('findOpportunities')}
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/register"
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold transition-colors shadow-lg"
              >
                Get Started - Join as Volunteer
              </Link>
              <Link
                to="/login"
                className="bg-emerald-700 text-white px-8 py-3 rounded-lg hover:bg-emerald-800 font-semibold transition-colors border-2 border-white"
              >
                Login
              </Link>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <div className={`flex flex-col md:flex-row gap-2 ${showFilters ? 'block' : 'hidden md:flex'}`}>
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  >
                    <option value="all">{t('allTypes')}</option>
                    <option value="onsite">{t('onsite')}</option>
                    <option value="remote">{t('remote')}</option>
                    <option value="hybrid">{t('hybrid')}</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section (for authenticated users) */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <p className="text-3xl font-bold text-emerald-600">{opportunities.length}</p>
                <p className="text-gray-600">Active Opportunities</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-blue-600">500+</p>
                <p className="text-gray-600">Active Volunteers</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-purple-600">50+</p>
                <p className="text-gray-600">Partner Organizations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Organization Create Button (for authenticated users without organization) */}
        {isAuthenticated && !user?.organizationId && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are you an organization?
                </h3>
                <p className="text-gray-600">
                  Create your organization profile and start posting volunteer opportunities
                </p>
              </div>
              <Link
                to="/create-organization"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>{t('createOrg')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filterMode !== 'all' || filterCategory !== 'all' || searchQuery) && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterMode !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {t(filterMode)}
                <button onClick={() => setFilterMode('all')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {categories.find(c => c.value === filterCategory)?.label}
                <button onClick={() => setFilterCategory('all')} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterMode('all')
                setFilterCategory('all')
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredOpportunities.length}</span> 
            {' '}opportunities found
          </p>
        </div>

        {/* Opportunities Grid */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-red-600 text-lg mb-4">Failed to load opportunities</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
                <div className="max-w-md mx-auto">
                  <p className="text-gray-600 text-lg mb-4">{t('noResults')}</p>
                  {(searchQuery || filterMode !== 'all' || filterCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setFilterMode('all')
                        setFilterCategory('all')
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear filters to see all opportunities
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA Section for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 px-4 mt-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of volunteers and start contributing to meaningful causes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold transition-colors shadow-lg"
              >
                Sign Up Now
              </Link>
              <Link
                to="/about"
                className="bg-emerald-700 text-white px-8 py-3 rounded-lg hover:bg-emerald-800 font-semibold transition-colors border-2 border-white"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
