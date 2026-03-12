import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import { ArrowRight, UserPlus, Search, FileText, Star, Building2, CheckSquare, Send, Award } from 'lucide-react'

const HowItWorks = () => {
  const { currentLanguage } = useLanguage()
  const en = currentLanguage === 'en'
  const [activeRole, setActiveRole] = useState('volunteer')

  const volunteerSteps = [
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: en ? 'Create Your Profile' : 'ပရိုဖိုင်ဖန်တီးပါ',
      desc: en
        ? 'Sign up with your email, verify your account, and fill in your interests, skills, and availability. It takes less than 2 minutes.'
        : 'သင်၏ email ဖြင့် မှတ်ပုံတင်ပြီး၊ အကောင့်အတည်ပြုကာ သင်၏ စိတ်ဝင်စားမှုများ၊ ကျွမ်းကျင်မှုများနှင့် အချိန်ဇယားကို ဖြည့်ပါ။',
      badge: en ? 'Step 1' : 'အဆင့် ၁',
      color: '#059669',
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: en ? 'Browse Opportunities' : 'အခွင့်အလမ်းများ ရှာဖွေပါ',
      desc: en
        ? 'Explore hundreds of verified volunteer opportunities filtered by category, location, or type (onsite, remote, hybrid). Save ones you like.'
        : 'အမျိုးအစား၊ တည်နေရာ သို့မဟုတ် အမျိုးအစားအလိုက် စစ်ထုတ်ထားသော အတည်ပြုထားသောအခွင့်အလမ်းများ ရှာဖွေပါ။',
      badge: en ? 'Step 2' : 'အဆင့် ၂',
      color: '#2563eb',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: en ? 'Apply & Get Accepted' : 'လျှောက်ပြီး လက်ခံခံပါ',
      desc: en
        ? 'Submit your application with a personal message. Organizations review and respond within days. Track your application status in real time.'
        : 'ကိုယ်ရေးရာဇဝင်ဖြင့် လျှောက်လွှာတင်ပါ။ အဖွဲ့အစည်းများက ရက်အနည်းငယ်အတွင်း ပြန်ကြားမည်ဖြစ်ပြီး အချိန်နှင့်တပြေးညီ စစ်ဆေးနိုင်သည်။',
      badge: en ? 'Step 3' : 'အဆင့် ၃',
      color: '#7c3aed',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: en ? 'Volunteer & Earn Certificate' : 'စေတနာ့ဝန်ထမ်းလုပ်ပြီး လက်မှတ်ရယူပါ',
      desc: en
        ? 'Complete your volunteer service and receive a verified digital certificate you can download and share on your resume or LinkedIn profile.'
        : 'စေတနာ့ဝန်ထမ်းဝန်ဆောင်မှုပြီးဆုံးသောအခါ ဒေါင်းလုဒ်ဆွဲ၍ Resume တွင် ထည့်နိုင်သော ဒစ်ဂျစ်တယ်လက်မှတ် ရရှိသည်။',
      badge: en ? 'Step 4' : 'အဆင့် ၄',
      color: '#d97706',
    },
  ]

  const orgSteps = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: en ? 'Register Your Organization' : 'အဖွဲ့အစည်းမှတ်ပုံတင်ပါ',
      desc: en
        ? 'Create an account, then submit your organization profile for admin review. Include your mission, contact info, and supporting documents.'
        : 'အကောင့်ဖန်တီးပြီး admin စစ်ဆေးရန် အဖွဲ့အစည်းပရိုဖိုင်တင်ပါ။ သင်၏ ရည်ရွယ်ချက်၊ ဆက်သွယ်ရန်နှင့် စာရွက်စာတမ်းများ ထည့်ပါ။',
      badge: en ? 'Step 1' : 'အဆင့် ၁',
      color: '#059669',
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: en ? 'Get Verified by Admin' : 'Admin မှ အတည်ပြုခံပါ',
      desc: en
        ? 'Our admin team reviews your submission and approves your organization — typically within 24–48 hours. You\'ll be notified by email.'
        : 'Admin အဖွဲ့က သင်၏တင်သွင်းချက်ကို စစ်ဆေးပြီး ၂၄–၄၈ နာရီအတွင်း အတည်ပြုကာ email ဖြင့် အကြောင်းကြားသည်။',
      badge: en ? 'Step 2' : 'အဆင့် ၂',
      color: '#2563eb',
    },
    {
      icon: <Send className="w-6 h-6" />,
      title: en ? 'Post Opportunities' : 'အခွင့်အလမ်းများ တင်ပါ',
      desc: en
        ? 'Create detailed volunteer listings with location, schedule, category, and requirements. Optionally use our AI assistant to draft descriptions.'
        : 'တည်နေရာ၊ အချိန်ဇယား၊ အမျိုးအစားနှင့် လိုအပ်ချက်များဖြင့် အသေးစိတ်ကြော်ငြာများ ဖန်တီးပါ။',
      badge: en ? 'Step 3' : 'အဆင့် ၃',
      color: '#7c3aed',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: en ? 'Manage & Issue Certificates' : 'စီမံပြီး လက်မှတ်ထုတ်ပေးပါ',
      desc: en
        ? 'Review applications, accept or decline volunteers, and issue digital certificates to volunteers who complete their service with you.'
        : 'လျှောက်လွှာများ စစ်ဆေးပြီး လက်ခံ/ငြင်းပယ်ကာ ဝန်ဆောင်မှုပြီးသော စေတနာ့ဝန်ထမ်းများကို ဒစ်ဂျစ်တယ်လက်မှတ် ထုတ်ပေးပါ။',
      badge: en ? 'Step 4' : 'အဆင့် ၄',
      color: '#d97706',
    },
  ]

  const steps = activeRole === 'volunteer' ? volunteerSteps : orgSteps

  const faqs = en ? [
    { q: 'Is it free to volunteer?', a: 'Yes — MyanVolunteer is completely free for volunteers. There are no fees to create an account, apply for opportunities, or download your certificates.' },
    { q: 'How do I know organizations are legitimate?', a: 'Every organization must submit supporting documents and be manually reviewed and approved by our admin team before they can post any opportunities.' },
    { q: 'What languages does the platform support?', a: 'MyanVolunteer is fully bilingual — you can switch between English and Burmese at any time using the language toggle in the navigation bar.' },
    { q: 'Can I volunteer remotely?', a: 'Yes! Many opportunities offer remote or hybrid options. Use the type filter on the home page to find remote-friendly listings.' },
  ] : [
    { q: 'အခမဲ့ဝင်ရောက်နိုင်ပါသလား?', a: 'ဟုတ်ပါသည် — MyanVolunteer သည် စေတနာ့ဝန်ထမ်းများအတွက် လုံးဝအခမဲ့ဖြစ်သည်။ အကောင့်ဖန်တီးခြင်း၊ လျှောက်ထားခြင်းနှင့် လက်မှတ်ဒေါင်းလုဒ်ဆွဲခြင်းအတွက် ကုန်ကျစရိတ်မရှိပါ။' },
    { q: 'အဖွဲ့အစည်းများ စစ်မှန်ကြောင်း မည်သို့သိနိုင်မည်နည်း?', a: 'အဖွဲ့အစည်းတိုင်းသည် အထောက်အထားများတင်ပြပြီး admin အဖွဲ့မှ လူကိုယ်တိုင်စစ်ဆေးအတည်ပြုမှသာ အခွင့်အလမ်းများ တင်နိုင်သည်။' },
    { q: 'ဘာသာစကားမည်မျှ ပံ့ပိုးသနည်း?', a: 'MyanVolunteer သည် မြန်မာဘာသာနှင့် အင်္ဂလိပ်ဘာသာ နှစ်ဘာသာ ပြည့်ဝစွာ ပံ့ပိုးသည်။ Navigation bar မှ ဘာသာပြောင်းနိုင်သည်။' },
    { q: 'အဝေးမှ စေတနာ့ဝန်ထမ်းလုပ်နိုင်ပါသလား?', a: 'ဟုတ်ပါသည်! အဝေးမှ သို့မဟုတ် hybrid ရွေးချယ်မှုနှင့် အခွင့်အလမ်းများ ရှိပါသည်။ ပင်မစာမျက်နှာ၏ filter ကို အသုံးပြုပါ။' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)' }}>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Hero ── */}
        <div className="pt-20 pb-12 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
            ⚡ {en ? 'Simple & Fast' : 'ရိုးရှင်းပြီး မြန်ဆန်သည်'}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-1.5px' }}>
            {en ? 'How It ' : ''}<span style={{ color: '#059669' }}>{en ? 'Works' : 'အလုပ်လုပ်ပုံ'}</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10">
            {en
              ? 'Getting started is easy. Whether you\'re a volunteer or an organization, we\'ve made the process as simple as possible.'
              : 'စတင်ရန် လွယ်ကူပါသည်။ စေတနာ့ဝန်ထမ်းဖြစ်ဖြစ် အဖွဲ့အစည်းဖြစ်ဖြစ် လုပ်ငန်းစဉ်ကို ရိုးရှင်းအောင် ပြုလုပ်ထားသည်။'}
          </p>

          {/* Role toggle */}
          <div className="inline-flex p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.15)' }}>
            {[
              { id: 'volunteer', label: en ? '🙋 I\'m a Volunteer' : '🙋 စေတနာ့ဝန်ထမ်း' },
              { id: 'org', label: en ? '🏢 I\'m an Organization' : '🏢 အဖွဲ့အစည်း' },
            ].map(r => (
              <button key={r.id} onClick={() => setActiveRole(r.id)}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: activeRole === r.id ? 'linear-gradient(135deg, #059669, #0d9488)' : 'transparent',
                  color: activeRole === r.id ? '#fff' : '#6b7280',
                  boxShadow: activeRole === r.id ? '0 4px 16px rgba(5,150,105,0.25)' : 'none',
                  border: 'none', cursor: 'pointer'
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Steps ── */}
        <div className="max-w-4xl mx-auto px-4 mb-20">
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute left-8 top-10 bottom-10 w-0.5"
              style={{ background: 'linear-gradient(to bottom, #059669, #0891b2)', opacity: 0.2, marginLeft: 28 }} />

            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6 p-7 rounded-2xl transition-all duration-300 group"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${step.color}22`,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${step.color}15`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'}>

                  {/* Step number circle */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`, boxShadow: `0 6px 20px ${step.color}35` }}>
                    {i + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: `${step.color}12`, color: step.color, border: `1px solid ${step.color}22` }}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="flex-shrink-0 self-center hidden md:flex w-10 h-10 rounded-xl items-center justify-center"
                    style={{ background: `${step.color}10`, color: step.color }}>
                    {step.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-4xl mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.5px' }}>
              {en ? 'Frequently Asked Questions' : 'မေးလေ့ရှိသောမေးခွန်းများ'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.1)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h4 className="font-bold text-gray-900 mb-2 text-sm">{faq.q}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="text-center p-12 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', boxShadow: '0 20px 60px rgba(5,150,105,0.25)' }}>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: '-0.5px' }}>
              {en ? 'Ready to get started?' : 'စတင်ရန် အဆင်သင့်ဖြစ်ပြီလား?'}
            </h2>
            <p className="text-emerald-100 mb-8 text-lg">
              {en ? 'Join thousands of volunteers making a difference across Myanmar.' : 'မြန်မာတစ်နိုင်ငံလုံးတွင် ပြောင်းလဲမှုဖန်တီးနေသော စေတနာ့ဝန်ထမ်းများနှင့် ပူးပေါင်းပါ။'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold transition-all"
                style={{ background: '#fff', color: '#059669', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                {en ? 'Get Started Free' : 'အခမဲ့စတင်ပါ'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/categories"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                {en ? 'Browse Categories' : 'အမျိုးအစားများ ကြည့်ပါ'}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default HowItWorks
