import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">{t('myProfile')}</h1>
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700">{t('name')}</label>
            <p className="text-gray-900">{user?.name}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">{t('email')}</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">{t('phone')}</label>
            <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile