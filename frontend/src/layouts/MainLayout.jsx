import React from 'react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
