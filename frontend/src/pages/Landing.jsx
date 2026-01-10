import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Shield, ArrowRight, Heart, Building2 } from 'lucide-react'
import DynamicBackground from '../components/common/DynamicBackground'

const Landing = () => {
  return (
    <DynamicBackground category="volunteer" overlay={0.7}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <Heart className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Welcome to MyanVolunteer
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-lg">
              Connecting Hands, Building Hope - Choose your path to make a difference
            </p>
          </div>

          {/* Two Paths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* User Path */}
            <Link 
              to="/user-portal"
              className="group relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                  I'm a User
                </h2>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Join as a volunteer to find opportunities or create an organization to post volunteer needs
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Heart className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>Find volunteer opportunities</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Building2 className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>Create your organization</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>Connect with volunteers</span>
                  </div>
                </div>

                <div className="flex items-center justify-center text-emerald-600 font-semibold group-hover:text-emerald-700">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Admin Path */}
            <Link 
              to="/admin/login"
              className="group relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                  I'm an Admin
                </h2>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Access the admin dashboard to manage users, organizations, and platform operations
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Shield className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    <span>Manage user accounts</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Building2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    <span>Verify organizations</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    <span>Monitor platform activity</span>
                  </div>
                </div>

                <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Admin Login</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-white/80 text-sm">
              New to MyanVolunteer? Choose "I'm a User" to get started!
            </p>
          </div>
        </div>
      </div>
    </DynamicBackground>
  )
}

export default Landing
