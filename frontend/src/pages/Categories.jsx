import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const Categories = () => {
  const { t } = useLanguage()
  
  const categories = [
    { name: t('environment'), icon: '🌱' },
    { name: t('education_cat'), icon: '📚' },
    { name: t('healthcare'), icon: '🏥' },
    { name: t('community'), icon: '🤝' },
    { name: t('animals'), icon: '🐾' },
    { name: t('arts'), icon: '🎨' }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('categories')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="text-xl font-bold">{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Categories