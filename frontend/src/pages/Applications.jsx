import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '../context/LanguageContext'
import { volunteerService } from '../services/volunteerService'
import Loader from '../components/common/Loader'

const Applications = () => {
  const { t } = useLanguage()
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: volunteerService.getMyApplications
  })
  
  if (isLoading) return <Loader />
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('applications')}</h1>
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{app.opportunity.title}</h3>
                    <p className="text-gray-600">{app.opportunity.organization.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {t(app.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No applications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications