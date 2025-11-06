import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '../context/LanguageContext'
import { volunteerService } from '../services/volunteerService'
import OpportunityCard from '../components/volunteer/OpportunityCard'
import Loader from '../components/common/Loader'

const SavedOpportunities = () => {
  const { t } = useLanguage()
  const { data: saved, isLoading } = useQuery({
    queryKey: ['savedOpportunities'],
    queryFn: volunteerService.getSavedOpportunities
  })
  
  if (isLoading) return <Loader />
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('savedTasks')}</h1>
        {saved && saved.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No saved opportunities</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedOpportunities