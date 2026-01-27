import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Award, Calendar, Clock, MessageSquare } from 'lucide-react'

const CertificateModal = ({ isOpen, onClose, applicant, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    hoursContributed: '10',
    completionDate: new Date().toISOString().split('T')[0],
    customMessage: ''
  })

  const [errors, setErrors] = useState({})

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {}

    if (!formData.hoursContributed || isNaN(formData.hoursContributed) || formData.hoursContributed < 1) {
      newErrors.hoursContributed = 'Please enter a valid number of hours (minimum 1)'
    }

    if (formData.hoursContributed > 1000) {
      newErrors.hoursContributed = 'Hours cannot exceed 1000'
    }

    if (!formData.completionDate) {
      newErrors.completionDate = 'Completion date is required'
    }

    const selectedDate = new Date(formData.completionDate)
    const today = new Date()
    if (selectedDate > today) {
      newErrors.completionDate = 'Completion date cannot be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        hoursContributed: parseInt(formData.hoursContributed)
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={!isLoading ? onClose : undefined}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div 
          className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Issue Certificate</h2>
                  <p className="text-blue-100 text-sm">Generate completion certificate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Volunteer Info */}
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {applicant?.volunteerName?.charAt(0) || 'V'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{applicant?.volunteerName}</p>
                <p className="text-sm text-gray-600 truncate">{applicant?.opportunityTitle}</p>
                <p className="text-xs text-gray-500 truncate">{applicant?.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Hours Contributed */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hours Contributed <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hoursContributed"
                value={formData.hoursContributed}
                onChange={handleChange}
                min="1"
                max="1000"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.hoursContributed ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="10"
                disabled={isLoading}
              />
              {errors.hoursContributed && (
                <p className="text-red-500 text-sm mt-1">{errors.hoursContributed}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Total hours the volunteer contributed to this opportunity
              </p>
            </div>

            {/* Completion Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Completion Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.completionDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.completionDate && (
                <p className="text-red-500 text-sm mt-1">{errors.completionDate}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Date when the volunteer completed their service
              </p>
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Custom Message (Optional)
              </label>
              <textarea
                name="customMessage"
                value={formData.customMessage}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Add a personal message or note of appreciation..."
                maxLength="500"
                disabled={isLoading}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {formData.customMessage.length}/500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>📧 Certificate will be:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>✓ Generated with your organization's details</li>
                  <li>✓ Sent via email to the volunteer</li>
                  <li>✓ Include a QR code for verification</li>
                  <li>✓ Downloadable in high quality</li>
                </ul>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    Generate Certificate
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  // Render modal using portal to document.body
  return createPortal(modalContent, document.body)
}

export default CertificateModal
