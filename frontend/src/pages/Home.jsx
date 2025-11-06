import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus } from 'lucide-react'
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

  const { data: opportunitiesData, isLoading } = useQuery({
    queryKey: ['opportunities', filterMode],
    queryFn: () => volunteerService.getOpportunities({ mode: filterMode !== 'all' ? filterMode : undefined })
  })

  // Extract array from response
  const opportunities = Array.isArray(opportunitiesData?.data) ? opportunitiesData.data : []

  const filteredOpportunities = opportunities.filter(opp => 
    opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('makeADifference')}
          </h1>
          <p className="text-xl mb-8">
            {t('findOpportunities')}
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="all">{t('allTypes')}</option>
                <option value="onsite">{t('onsite')}</option>
                <option value="remote">{t('remote')}</option>
                <option value="hybrid">{t('hybrid')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isAuthenticated && !user?.organizationId && (
          <div className="mb-8">
            <Link
              to="/create-organization"
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>{t('createOrg')}</span>
            </Link>
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">{t('noResults')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home