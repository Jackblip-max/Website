import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Shield, Heart, Building2 } from 'lucide-react'
import DynamicBackground from '../components/common/DynamicBackground'

const Landing = () => {
  return (
    <DynamicBackground category="volunteer" overlay={0.7}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform hover:rotate-12 transition-transform">
                <Heart className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Welcome to MyanVolunteer
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-lg mb-2">
              Connecting Hands, Building Hope
            </p>
            <p className="text-lg text-white/80 drop-shadow-lg">
              Choose your path to make a difference
            </p>
          </div>

          {/* Login/Register Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-16">
            <Link
              to="/login"
              className="flex-1 bg-white text-emerald-600 px-8 py-4 rounded-xl hover:bg-gray-100 font-bold transition-all transform hover:scale-105 shadow-2xl text-center text-lg border-2 border-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 font-bold transition-all transform hover:scale-105 shadow-2xl text-center text-lg border-2 border-white/20"
            >
              Register
            </Link>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* User/Volunteer Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  For Users & Volunteers
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join our community to find meaningful volunteer opportunities across Myanmar
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <Heart className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Find Opportunities</p>
                      <p className="text-sm text-gray-600">Browse and apply for volunteer positions</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Building2 className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Create Organization</p>
                      <p className="text-sm text-gray-600">Post volunteer needs for your cause</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Make an Impact</p>
                      <p className="text-sm text-gray-600">Connect with like-minded volunteers</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Click <span className="font-bold text-emerald-600">Register</span> above to get started
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Card */}
            <Link 
              to="/admin/login"
              className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all hover:shadow-blue-500/50"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  For Administrators
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Manage platform operations and oversee community activities
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">User Management</p>
                      <p className="text-sm text-gray-600">Oversee all user accounts and activities</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Building2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Organization Verification</p>
                      <p className="text-sm text-gray-600">Review and approve organizations</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Platform Monitoring</p>
                      <p className="text-sm text-gray-600">Track engagement and system health</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                    <span>Access Admin Dashboard</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 max-w-2xl mx-auto">
              <p className="text-white text-sm">
                <span className="font-bold">New users:</span> Click Register • 
                <span className="font-bold"> Existing users:</span> Click Login • 
                <span className="font-bold"> Admins:</span> Click the admin card
              </p>
            </div>
          </div>
        </div>
      </div>
    </DynamicBackground>
  )
}

export default Landing
