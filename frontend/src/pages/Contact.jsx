import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const Contact = () => {
  const { currentLanguage } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-6">
          {currentLanguage === 'en' ? 'Contact Us' : 'ဆက်သွယ်ရန်'}
        </h1>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Email</h3>
            <p className="text-gray-600">contact@myanvolunteer.org</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Phone</h3>
            <p className="text-gray-600">+95 9 123 456 789</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Address</h3>
            <p className="text-gray-600">Yangon, Myanmar</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact