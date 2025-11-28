import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Bookmark, Share2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { volunteerService } from '../../services/volunteerService'

const OpportunityCard = ({ opportunity }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [isSaved, setIsSaved] = useState(opportunity.isSaved || false)

  const saveMutation = useMutation({
    mutationFn: (oppId) => 
      isSaved ? volunteerService.unsaveOpportunity(oppId) : volunteerService.saveOpportunity(oppId),
    onSuccess: () => {
      setIsSaved(!isSaved)
      toast.success(isSaved ? 'Removed from saved' : 'Saved successfully!')
      queryClient.invalidateQueries(['savedOpportunities'])
    },
    onError: () => {
      toast.error('Failed to save opportunity')
    }
  })

  const applyMutation = useMutation({
    mutationFn: (oppId) => volunteerService.applyToOpportunity(oppId),
    onSuccess: () => {
      toast.success('Application submitted successfully! 🎉')
      queryClient.invalidateQueries(['applications'])
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to submit application'
      toast.error(message)
    }
  })

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save opportunities')
      setTimeout(() => navigate('/login'), 1500)
      return
    }
    saveMutation.mutate(opportunity.id)
  }

  const handleApply = () => {
    if (!isAuthenticated) {
      toast((t) => (
        <div className="flex flex-col">
          <p className="font-semibold mb-2">Please register or login to apply</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/register')
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
              Register
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/login')
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Login
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        style: {
          minWidth: '300px',
        },
      })
      return
    }
    applyMutation.mutate(opportunity.id)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/opportunities/${opportunity.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const getModeColor = (mode) => {
    switch(mode) {
      case 'onsite': return 'bg-blue-100 text-blue-800'
      case 'remote': return 'bg-purple-100 text-purple-800'
      case 'hybrid': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
            <p className="text-emerald-600 font-medium mb-1">{opportunity.organizationName}</p>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{opportunity.location}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getModeColor(opportunity.mode)}`}>
            {t(opportunity.mode)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{opportunity.description}</p>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{t('deadline')}: {new Date(opportunity.deadline).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Clock className="w-4 h-4 mr-1" />
          <span>{opportunity.timeCommitment}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={applyMutation.isPending}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {applyMutation.isPending ? 'Applying...' : t('apply')}
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={`p-2 rounded-lg border-2 transition-colors ${
              isSaved
                ? 'bg-emerald-100 border-emerald-600 text-emerald-600'
                : 'border-gray-300 text-gray-600 hover:border-emerald-600'
            }`}
            title={isSaved ? 'Unsave' : 'Save for later'}
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-emerald-600 transition-colors"
            title="Share this opportunity"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default OpportunityCard
