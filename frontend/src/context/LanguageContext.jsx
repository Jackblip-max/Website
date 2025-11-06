import React, { createContext, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext(null)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    setCurrentLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'my' : 'en'
    changeLanguage(newLang)
  }

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}