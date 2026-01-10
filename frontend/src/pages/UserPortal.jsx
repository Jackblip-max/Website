import React from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, LogIn, ArrowLeft } from 'lucide-react'
import DynamicBackground from '../components/common/DynamicBackground'

const UserPortal = () => {
  return (
    <DynamicBackground category="minimal" overlay={0.85}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Back Button */}
          <Link 
            to="/"
            className="inline-flex items-center text-white hover:text-emerald-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              Welcome, Changemaker!
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg">
              Choose how you'd like to continue
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Register Option */}
            <Link 
              to="/register"
              className="group relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                  Create Account
                </h2>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  New to MyanVolunteer? Sign up to start your journey as a volunteer or organization
                </p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-emerald-800 font-medium">
                    ✨ Get started in minutes
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Free • Easy setup • Email verification required
                  </p>
                </div>

                <div className="flex items-center justify-center text-emerald-600 font-semibold group-hover:text-emerald-700">
                  <span>Sign Up Now</span>
                  <UserPlus className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Login Option */}
            <Link 
              to="/login"
              className="group relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                  Login
                </h2>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Already have an account? Sign in to continue your volunteer journey
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 font-medium">
                    🔐 Secure access
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your account • Your opportunities • Your impact
                  </p>
                </div>

                <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Sign In</span>
                  <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-white/80 text-sm">
              Not sure which to choose? Create an account to get started!
            </p>
          </div>
        </div>
      </div>
    </DynamicBackground>
  )
}

export default UserPortal
