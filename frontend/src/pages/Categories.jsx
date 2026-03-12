import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const Categories = () => {
  const { t, currentLanguage } = useLanguage()
  const en = currentLanguage === 'en'
  const [hovered, setHovered] = useState(null)

  const categories = [
    {
      key: 'environment',
      icon: '🌱',
      color: '#059669',
      bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      border: 'rgba(5,150,105,0.2)',
      count: '12',
      desc: en
        ? 'Tree planting, river clean-ups, recycling drives, and conservation projects protecting Myanmar\'s natural heritage.'
        : 'သစ်ပင်စိုက်ခြင်း၊ မြစ်ရေသန့်ရှင်းရေး၊ ပြန်လည်အသုံးပြုခြင်းနှင့် မြန်မာ့သဘာဝပတ်ဝန်းကျင် ထိန်းသိမ်းမှုများ။'
    },
    {
      key: 'education_cat',
      icon: '📚',
      color: '#2563eb',
      bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      border: 'rgba(37,99,235,0.2)',
      count: '18',
      desc: en
        ? 'Tutoring, literacy programs, school support, and skills workshops helping young minds reach their potential.'
        : 'သင်ကြားပေးခြင်း၊ ကျောင်းပံ့ပိုးမှုနှင့် ကျွမ်းကျင်မှုသင်တန်းများဖြင့် လူငယ်များ၏ အလားအလာကို မြှင့်တင်ခြင်း။'
    },
    {
      key: 'healthcare',
      icon: '🏥',
      color: '#dc2626',
      bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      border: 'rgba(220,38,38,0.2)',
      count: '9',
      desc: en
        ? 'Health camps, medical outreach, mental health awareness, and support for hospitals and community clinics.'
        : 'ကျန်းမာရေးစခန်းများ၊ ဆေးရုံ/ဆေးခန်းပံ့ပိုးမှုနှင့် ကျန်းမာရေးအသိပညာပြန့်ပွားရေး လုပ်ငန်းများ။'
    },
    {
      key: 'community',
      icon: '🤝',
      color: '#d97706',
      bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      border: 'rgba(217,119,6,0.2)',
      count: '24',
      desc: en
        ? 'Neighborhood development, food drives, elderly care, disaster relief, and projects that bring communities together.'
        : 'အိမ်နီးချင်းဖွံ့ဖြိုးမှု၊ အစားအစာနှင့် သက်ကြီးရွယ်အိုဂရုစိုက်ခြင်း၊ ဘေးအန္တရာယ်ကယ်ဆယ်ရေးများ။'
    },
    {
      key: 'animals',
      icon: '🐾',
      color: '#7c3aed',
      bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      border: 'rgba(124,58,237,0.2)',
      count: '7',
      desc: en
        ? 'Animal shelter support, wildlife conservation, stray animal care, and campaigns for animal welfare and protection.'
        : 'တိရစ္ဆာန်ဖခင်မဲ့ကောင်ထိန်းသိမ်းမှု၊ တောရိုင်းတိရစ္ဆာန်ထိန်းသိမ်းရေးနှင့် တိရစ္ဆာန်ကာကွယ်ရေး။'
    },
    {
      key: 'arts',
      icon: '🎨',
      color: '#db2777',
      bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
      border: 'rgba(219,39,119,0.2)',
      count: '11',
      desc: en
        ? 'Cultural festivals, mural projects, traditional arts preservation, music events, and creative community programs.'
        : 'ယဉ်ကျေးမှုပွဲတော်များ၊ ကြွေးကြော်ချက်ရုပ်ပုံများ၊ ရိုးရာသနပ်ထိန်းသိမ်းခြင်းနှင့် ဖန်တီးမှုလုပ်ငန်းများ။'
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)' }}>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '0%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="pt-20 pb-12 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
            🗂️ {en ? 'Explore by Category' : 'အမျိုးအစားအလိုက် ရှာဖွေပါ'}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-1.5px' }}>
            {en ? 'Volunteer ' : ''}<span style={{ color: '#059669' }}>{en ? 'Categories' : 'အမျိုးအစားများ'}</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            {en
              ? 'Find opportunities that match your passion. Every category needs dedicated volunteers like you.'
              : 'သင်၏စိတ်ဝင်စားမှုနှင့် ကိုက်ညီသောအခွင့်အလမ်းများ ရှာဖွေပါ။'}
          </p>
        </div>

        {/* ── Category Grid ── */}
        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Link
                to={`/?category=${cat.key}`}
                key={i}
                className="block rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${cat.border}`,
                  boxShadow: hovered === i ? `0 16px 48px rgba(0,0,0,0.1), 0 0 0 2px ${cat.color}22` : '0 2px 16px rgba(0,0,0,0.05)',
                  transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
                  textDecoration: 'none'
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Color band */}
                <div className="h-2" style={{ background: cat.bg }} />

                <div className="p-6">
                  {/* Icon + count */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: cat.bg }}>
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${cat.color}14`, color: cat.color, border: `1px solid ${cat.color}22` }}>
                      {cat.count} {en ? 'open' : 'ဖွင့်ထား'}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t(cat.key)}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{cat.desc}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-sm font-semibold transition-all"
                    style={{ color: cat.color }}>
                    {en ? 'Browse opportunities' : 'အခွင့်အလမ်းများကြည့်ရန်'}
                    <ArrowRight className="w-4 h-4" style={{ transform: hovered === i ? 'translateX(4px)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom note */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              {en
                ? 'Can\'t find your area of interest? '
                : 'သင့်စိတ်ဝင်စားသောနယ်ပယ် မတွေ့ဘူးလား? '}
              <Link to="/register" className="font-semibold" style={{ color: '#059669' }}>
                {en ? 'Create an organization profile →' : 'အဖွဲ့အစည်းပရိုဖိုင်ဖန်တီးပါ →'}
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Categories
