import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const About = () => {
  const { t, currentLanguage } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-6">
          {currentLanguage === 'en' ? 'About MyanVolunteer' : 'MyanVolunteer အကြောင်း'}
        </h1>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 mb-4">
            {currentLanguage === 'en' 
              ? 'MyanVolunteer connects passionate volunteers with meaningful opportunities across Myanmar. We believe in the power of community service to transform lives and build a better future.'
              : 'MyanVolunteer သည် စိတ်အားထက်သန်သော စေတနာ့ဝန်ထမ်းများကို မြန်မာနိုင်ငံတစ်ဝှမ်းရှိ အဓိပ္ပာယ်ရှိသောအခွင့်အလမ်းများနှင့် ချိတ်ဆက်ပေးပါသည်။'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default About