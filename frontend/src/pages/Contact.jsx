import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, Heart } from 'lucide-react'

const Contact = () => {
  const { currentLanguage } = useLanguage()
  const en = currentLanguage === 'en'
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: en ? 'Email Us' : 'အီးမေးလ်',
      value: 'Myanmar1234@gmail.com',
      link: 'mailto:Myanmar1234@gmail.com',
      color: '#059669',
      bg: 'rgba(5,150,105,0.1)',
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: en ? 'Call Us' : 'ဖုန်းဆက်ရန်',
      value: '+95 9 123 456 789',
      link: 'tel:+959123456789',
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.1)',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: en ? 'Find Us' : 'တည်နေရာ',
      value: 'Yangon, Myanmar',
      link: 'https://maps.google.com/?q=Yangon,Myanmar',
      color: '#d97706',
      bg: 'rgba(217,119,6,0.1)',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: en ? 'Working Hours' : 'ဆောင်ရွက်ချိန်',
      value: en ? 'Mon–Fri, 9AM–6PM' : 'တနင်္လာ–သောကြာ ၉နာရီ–၆နာရီ',
      link: null,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.1)',
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)' }}>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* Hero */}
        <div className="pt-16 sm:pt-20 pb-10 sm:pb-12 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
            <MessageSquare className="w-4 h-4" />
            {en ? 'Get In Touch' : 'ဆက်သွယ်ပါ'}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gray-900" style={{ letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            {en ? "We'd Love to " : ''}<span style={{ color: '#059669' }}>{en ? 'Hear From You' : 'ဆက်သွယ်ရန်'}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            {en
              ? "Have a question or idea? Drop us a message and we'll get back to you."
              : 'မေးခွန်းများ သို့မဟုတ် ပူးပေါင်းဆောင်ရွက်လိုပါက ကျွန်ုပ်တို့ကို ဆက်သွယ်ပါ။'}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="max-w-5xl mx-auto px-4 mb-10 sm:mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {contactInfo.map((info, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl text-center transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${info.color}20`, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${info.color}20`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: info.bg, color: info.color }}>
                  {info.icon}
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{info.label}</p>
                {info.link ? (
                  <a href={info.link} target={info.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                    className="text-xs sm:text-sm font-semibold break-all hover:underline"
                    style={{ color: info.color }}>
                    {info.value}
                  </a>
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">{info.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form + Info */}
        <div className="max-w-5xl mx-auto px-4 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

            {/* Contact Form */}
            <div className="p-6 sm:p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'rgba(5,150,105,0.1)' }}>
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {en ? 'Message Sent!' : 'မက်ဆေ့ပေးပို့ပြီးပါပြီ!'}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {en ? "Thank you! We'll get back to you within 24 hours." : 'ကျေးဇူးတင်ပါသည်။ ၂၄ နာရီအတွင်း ပြန်ကြားပါမည်။'}
                  </p>
                  <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }) }}
                    className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
                    {en ? 'Send Another' : 'နောက်ထပ်ပို့မည်'}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1" style={{ letterSpacing: '-0.5px' }}>
                    {en ? 'Send a Message' : 'မက်ဆေ့ပို့ပါ'}
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">{en ? "We'll reply within 24 hours." : '၂၄ နာရီအတွင်း ပြန်ကြားပါမည်။'}</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{en ? 'Your Name' : 'နာမည်'} *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                          placeholder={en ? 'Ko Aung' : 'ကိုအောင်'}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{en ? 'Email' : 'အီးမေးလ်'} *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{en ? 'Subject' : 'ခေါင်းစဉ်'} *</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} required
                        placeholder={en ? 'How can we help?' : 'ဘာကူညီနိုင်မည်နည်း?'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{en ? 'Message' : 'မက်ဆေ့'} *</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
                        placeholder={en ? "Tell us what's on your mind..." : 'သင့်အကြောင်းပြောပြပါ...'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors resize-none bg-white" />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}>
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {en ? 'Sending...' : 'ပို့နေသည်...'}
                        </>
                      ) : (
                        <><Send className="w-4 h-4" />{en ? 'Send Message' : 'မက်ဆေ့ပို့မည်'}</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Right Side */}
            <div className="flex flex-col gap-5">
              <div className="p-6 sm:p-8 rounded-3xl"
                style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', boxShadow: '0 8px 32px rgba(5,150,105,0.25)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{en ? 'About MyanVolunteer' : 'MyanVolunteer အကြောင်း'}</h3>
                </div>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                  {en
                    ? "Myanmar's leading volunteer platform connecting passionate people with organizations making a difference. Our team is always here to help."
                    : 'မြန်မာနိုင်ငံ၏ ထိပ်တန်းစေတနာ့ပလက်ဖောင်းဖြစ်ပြီး အမြဲတမ်း ကူညီရန် အဆင်သင့်ရှိပါသည်။'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(en
                    ? ['Volunteers', 'Organizations', 'Partnerships', 'Support']
                    : ['စေတနာ့ဝန်ထမ်း', 'အဖွဲ့အစည်း', 'ပူးပေါင်းဆောင်ရွက်', 'ပံ့ပိုးမှု']
                  ).map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl flex-1"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ letterSpacing: '-0.3px' }}>
                  {en ? 'Quick Answers' : 'အမြန်အဖြေများ'}
                </h3>
                <div className="space-y-4">
                  {(en ? [
                    { q: 'How fast do you reply?', a: 'Usually within 24 hours on weekdays.' },
                    { q: 'Can organizations contact you?', a: 'Yes! We welcome partnership inquiries.' },
                    { q: 'Is the platform free?', a: 'Completely free for volunteers.' },
                  ] : [
                    { q: 'မည်မျှမြန်မြန် ပြန်ကြားမည်နည်း?', a: 'ရုံးဖွင့်ရက်များတွင် ၂၄ နာရီအတွင်း ပြန်ကြားပါမည်။' },
                    { q: 'အဖွဲ့အစည်းများ ဆက်သွယ်နိုင်သလား?', a: 'ဟုတ်ကဲ့! ပူးပေါင်းဆောင်ရွက်မှုများကို ကြိုဆိုပါသည်။' },
                    { q: 'Platform အသုံးပြုရန် ကြေးကောက်သလား?', a: 'စေတနာ့ဝန်ထမ်းများအတွက် လုံးဝအခမဲ့ဖြစ်သည်။' },
                  ]).map(({ q, a }, i) => (
                    <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{q}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Contact
