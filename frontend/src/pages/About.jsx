import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import { Heart, Users, Globe, Award, ArrowRight, CheckCircle } from 'lucide-react'

const About = () => {
  const { currentLanguage } = useLanguage()
  const en = currentLanguage === 'en'

  const stats = [
    { value: '500+', label: en ? 'Active Volunteers' : 'စေတနာ့ဝန်ထမ်းများ' },
    { value: '50+',  label: en ? 'Partner Organizations' : 'ပါတနာအဖွဲ့အစည်းများ' },
    { value: '6',    label: en ? 'Volunteer Categories' : 'အမျိုးအစားများ' },
    { value: '1000+',label: en ? 'Lives Impacted' : 'သက်ရောက်မှုများ' },
  ]

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: en ? 'Community First' : 'အသိုက်အဝန်းကို ဦးစားပေး',
      desc: en
        ? 'We put the needs of Myanmar\'s communities at the heart of everything we do, connecting volunteers where they\'re needed most.'
        : 'မြန်မာ့လူ့အဖွဲ့အစည်း၏ လိုအပ်ချက်များကို ကျွန်ုပ်တို့ လုပ်ဆောင်သမျှ၏ အဓိကနေရာတွင် ထားပါသည်။'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: en ? 'Nationwide Reach' : 'တစ်နိုင်ငံလုံး ပြန့်ကျယ်မှု',
      desc: en
        ? 'From Yangon to Mandalay, our platform connects volunteers across all regions of Myanmar with opportunities that create lasting impact.'
        : 'ရန်ကုန်မှ မန္တလေးအထိ ကျွန်ုပ်တို့ပလက်ဖောင်းသည် မြန်မာနိုင်ငံတစ်ဝှမ်းရှိ ဒေသများနှင့် ချိတ်ဆက်ပေးသည်။'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: en ? 'Trusted Platform' : 'ယုံကြည်ရသောပလက်ဖောင်း',
      desc: en
        ? 'All organizations are verified by our admin team before they can post opportunities, ensuring every listing is legitimate and safe.'
        : 'အဖွဲ့အစည်းများကို admin အဖွဲ့မှ စစ်ဆေးပြီးမှသာ အခွင့်အလမ်းများ တင်နိုင်သည်။'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: en ? 'Recognized Impact' : 'အသိအမှတ်ပြုမှု',
      desc: en
        ? 'Volunteers receive digital certificates upon completing their service, building a portfolio of meaningful contributions.'
        : 'စေတနာ့ဝန်ထမ်းများသည် ဝန်ဆောင်မှုပြီးဆုံးသောအခါ ဒစ်ဂျစ်တယ်လက်မှတ်များ ရရှိသည်။'
    },
  ]

  const team = [
    { initials: 'KM', name: en ? 'Ko Min' : 'ကိုမင်း', role: en ? 'Founder & CEO' : 'တည်ထောင်သူ & CEO', color: '#059669' },
    { initials: 'MA', name: en ? 'Ma Aye' : 'မေအေး', role: en ? 'Head of Operations' : 'စစ်ဆင်ရေးမှူး', color: '#0891b2' },
    { initials: 'TH', name: en ? 'Thura' : 'သူရ', role: en ? 'Tech Lead' : 'နည်းပညာမှူး', color: '#7c3aed' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)' }}>

      {/* Subtle background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Hero ── */}
        <div className="pt-20 pb-16 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
            <Heart className="w-4 h-4" />
            {en ? 'Our Story' : 'ကျွန်ုပ်တို့၏ ဇာတိကြောင်း'}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900" style={{ letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            {en ? 'About ' : ''}<span style={{ color: '#059669' }}>MyanVolunteer</span>
            {!en && ' အကြောင်း'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {en
              ? 'We\'re building Myanmar\'s most trusted volunteer platform — connecting passionate people with organizations doing meaningful work across the country.'
              : 'ကျွန်ုပ်တို့သည် မြန်မာနိုင်ငံ၏ အယုံကြည်ဆုံးသောစေတနာ့ဝန်ထမ်းပလက်ဖောင်းကို တည်ဆောက်နေပါသည်။'}
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="max-w-5xl mx-auto px-4 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                <div className="text-4xl font-black mb-1" style={{ color: '#059669', letterSpacing: '-1px' }}>{s.value}</div>
                <div className="text-sm font-medium text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mission ── */}
        <div className="max-w-5xl mx-auto px-4 mb-20">
          <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', boxShadow: '0 20px 60px rgba(5,150,105,0.25)' }}>
            <div className="p-10 md:p-14">
              <div className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-4">
                {en ? 'Our Mission' : 'ကျွန်ုပ်တို့၏ ရည်မှန်းချက်'}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight" style={{ letterSpacing: '-0.5px' }}>
                {en
                  ? 'Connecting hearts, transforming communities'
                  : 'နှလုံးများချိတ်ဆက်ကာ အသိုက်အဝန်းများပြောင်းလဲ'}
              </h2>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-2xl">
                {en
                  ? 'MyanVolunteer was founded on the belief that every person has something valuable to give. Our platform removes the barriers between willing volunteers and organizations that need help, creating a seamless ecosystem of community service throughout Myanmar.'
                  : 'MyanVolunteer ကို လူတိုင်းတွင် ပေးဆပ်ရန် တန်ဖိုးရှိသောအရာတစ်ခုခု ရှိသည်ဟူသော ယုံကြည်ချက်ဖြင့် တည်ထောင်ခဲ့သည်။'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {(en
                  ? ['Verified Organizations', 'Digital Certificates', 'Bilingual Support', 'Free for Volunteers']
                  : ['အတည်ပြုထားသောအဖွဲ့', 'ဒစ်ဂျစ်တယ်လက်မှတ်', 'နှစ်ဘာသာ', 'အခမဲ့']
                ).map((tag, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <CheckCircle className="w-3.5 h-3.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Values ── */}
        <div className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>
              {en ? 'What We Stand For' : 'ကျွန်ုပ်တို့ကိုယ်စားပြုသည့်အရာ'}
            </h2>
            <p className="text-gray-500">{en ? 'The principles that guide everything we build' : 'ကျွန်ုပ်တို့တည်ဆောက်သမျှကို လမ်းညွှန်သောမူများ'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div key={i} className="p-7 rounded-2xl group transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.1)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 40px rgba(5,150,105,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.18))', color: '#059669' }}>
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Team ── */}
        <div className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>
              {en ? 'The Team Behind It' : 'နောက်ကွယ်ရှိအဖွဲ့'}
            </h2>
            <p className="text-gray-500">{en ? 'Passionate about making Myanmar a better place' : 'မြန်မာပြည်ကို ပိုမိုကောင်းမွန်စေရန် စိတ်အားထက်သန်သူများ'}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {team.map((m, i) => (
              <div key={i} className="text-center p-6 rounded-2xl w-48"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3"
                  style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)` }}>
                  {m.initials}
                </div>
                <div className="font-bold text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-400 mt-1">{m.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="text-center p-12 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>
              {en ? 'Ready to make a difference?' : 'ပြောင်းလဲမှုဖန်တီးရန် အဆင်သင့်ဖြစ်ပြီလား?'}
            </h2>
            <p className="text-gray-500 mb-8">{en ? 'Join thousands of volunteers across Myanmar today.' : 'ယနေ့ပင် မြန်မာတစ်နိုင်ငံလုံးမှ စေတနာ့ဝန်ထမ်းများနှင့် ပူးပေါင်းပါ။'}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}>
                {en ? 'Join as Volunteer' : 'စေတနာ့ဝန်ထမ်းအဖြစ် ပါဝင်ပါ'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
                style={{ background: 'rgba(5,150,105,0.08)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>
                {en ? 'How It Works' : 'အလုပ်လုပ်ပုံ'}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default About
