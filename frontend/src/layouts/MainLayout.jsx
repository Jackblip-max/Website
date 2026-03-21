import React from 'react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow relative z-10 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
