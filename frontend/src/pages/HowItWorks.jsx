import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const HowItWorks = () => {
  const { currentLanguage } = useLanguage()
  
  const steps = currentLanguage === 'en' ? [
    { title: 'Register', desc: 'Create your volunteer profile' },
    { title: 'Browse', desc: 'Find opportunities that match your interests' },
    { title: 'Apply', desc: 'Submit your application' },
    { title: 'Volunteer', desc: 'Make a difference in your community' }
  ] : [
    { title: 'မှတ်ပုံတင်ရန်', desc: 'စေတနာ့ဝန်ထမ်းပရိုဖိုင်ဖန်တီးပါ' },
    { title: 'ရှာဖွေရန်', desc: 'သင်၏အကျိုးစီးပွားနှင့်ကိုက်ညီသောအခွင့်အလမ်းများရှာပါ' },
    { title: 'လျှောက်ထားရန်', desc: 'သင်၏လျှောက်လွှာကိုတင်သွင်းပါ' },
    { title: 'စေတနာ့ဝန်ထမ်း', desc: 'သင်၏အသိုက်အဝန်းတွင်ပြောင်းလဲမှုဖန်တီးပါ' }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {currentLanguage === 'en' ? 'How It Works' : 'အလုပ်လုပ်ပုံ'}
        </h1>
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md flex items-start">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">
                {idx + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HowItWorks