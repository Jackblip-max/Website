import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Bookmark, Share2, AlertCircle } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { volunteerService } from '../../services/volunteerService'

const OpportunityCard = ({ opportunity }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  
  // Check if opportunity is saved - ALWAYS fetch fresh data
  const { data: savedStatus, refetch: refetchSavedStatus } = useQuery({
    queryKey: ['savedStatus', opportunity.id],
    queryFn: async () => {
      const result = await volunteerService.checkIfSaved(opportunity.id)
      console.log('🔍 Saved status for opportunity', opportunity.id, ':', result)
      return result
    },
    enabled: isAuthenticated && user?.role === 'volunteer',
    staleTime: 0, // Always fetch fresh
    cacheTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  const [isSaved, setIsSaved] = useState(false)

  // Update isSaved state when savedStatus changes
  useEffect(() => {
    console.log('📊 SavedStatus changed for opportunity', opportunity.id, ':', savedStatus)
    if (savedStatus?.isSaved !== undefined) {
      setIsSaved(savedStatus.isSaved)
      console.log('✅ Set isSaved to:', savedStatus.isSaved, 'for opportunity', opportunity.id)
    } else {
      setIsSaved(false)
    }
  }, [savedStatus, opportunity.id])

  const saveMutation = useMutation({
    mutationFn: (oppId) => {
      console.log('💾 SAVE mutation called for opportunity:', oppId)
      return volunteerService.saveOpportunity(oppId)
    },
    onMutate: async (oppId) => {
      console.log('⚡ onMutate - Optimistically setting saved to TRUE for:', oppId)
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['savedStatus', oppId])
      
      // Snapshot previous value
      const previousStatus = queryClient.getQueryData(['savedStatus', oppId])
      
      // Optimistically update
      queryClient.setQueryData(['savedStatus', oppId], { isSaved: true })
      setIsSaved(true)
      
      return { previousStatus }
    },
    onSuccess: (data, oppId) => {
      console.log('✅ SAVE successful for opportunity:', oppId)
      toast.success('Saved successfully!')
      
      // Invalidate and refetch
      queryClient.invalidateQueries(['savedOpportunities'])
      queryClient.invalidateQueries(['savedStatus', oppId])
      refetchSavedStatus()
    },
    onError: (error, oppId, context) => {
      console.error('❌ SAVE failed for opportunity:', oppId, error)
      
      // Rollback optimistic update
      if (context?.previousStatus) {
        queryClient.setQueryData(['savedStatus', oppId], context.previousStatus)
        setIsSaved(context.previousStatus?.isSaved || false)
      } else {
        setIsSaved(false)
      }
      
      const message = error.response?.data?.message || 'Failed to save opportunity'
      toast.error(message)
    }
  })

  const unsaveMutation = useMutation({
    mutationFn: (oppId) => {
      console.log('🗑️ UNSAVE mutation called for opportunity:', oppId)
      return volunteerService.unsaveOpportunity(oppId)
    },
    onMutate: async (oppId) => {
      console.log('⚡ onMutate - Optimistically setting saved to FALSE for:', oppId)
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['savedStatus', oppId])
      
      // Snapshot previous value
      const previousStatus = queryClient.getQueryData(['savedStatus', oppId])
      
      // Optimistically update
      queryClient.setQueryData(['savedStatus', oppId], { isSaved: false })
      setIsSaved(false)
      
      return { previousStatus }
    },
    onSuccess: (data, oppId) => {
      console.log('✅ UNSAVE successful for opportunity:', oppId)
      toast.success('Removed from saved')
      
      // Invalidate and refetch
      queryClient.invalidateQueries(['savedOpportunities'])
      queryClient.invalidateQueries(['savedStatus', oppId])
      refetchSavedStatus()
    },
    onError: (error, oppId, context) => {
      console.error('❌ UNSAVE failed for opportunity:', oppId, error)
      
      // Rollback optimistic update
      if (context?.previousStatus) {
        queryClient.setQueryData(['savedStatus', oppId], context.previousStatus)
        setIsSaved(context.previousStatus?.isSaved || false)
      } else {
        setIsSaved(true)
      }
      
      const message = error.response?.data?.message || 'Failed to remove opportunity'
      toast.error(message)
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

  const handleSave = (e) => {
    e.stopPropagation()
    
    console.log('🔘 Bookmark clicked for opportunity:', opportunity.id)
    console.log('🔘 Current isSaved state:', isSaved)
    
    if (!isAuthenticated) {
      toast.error('Please login to save opportunities')
      setTimeout(() => navigate('/login'), 1500)
      return
    }

    if (user?.role !== 'volunteer') {
      toast.error('Only volunteers can save opportunities')
      return
    }
    
    // Call the appropriate mutation based on current state
    if (isSaved) {
      console.log('▶️ Calling UNSAVE mutation')
      unsaveMutation.mutate(opportunity.id)
    } else {
      console.log('▶️ Calling SAVE mutation')
      saveMutation.mutate(opportunity.id)
    }
  }

  const handleApply = (e) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast((toastInstance) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Login Required</p>
              <p className="text-sm text-gray-600">Please create an account or login to apply</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(toastInstance.id)
                navigate('/register')
              }}
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium"
            >
              Create Account
            </button>
            <button
              onClick={() => {
                toast.dismiss(toastInstance.id)
                navigate('/login')
              }}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
            >
              Login
            </button>
          </div>
        </div>
      ), {
        duration: 6000,
        style: { minWidth: '350px', maxWidth: '450px' }
      })
      return
    }
    
    applyMutation.mutate(opportunity.id)
  }

  const handleShare = (e) => {
    e.stopPropagation()
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

  const isLoading = saveMutation.isPending || unsaveMutation.isPending

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

        {!isAuthenticated && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Note:</span> You must be registered to apply
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={applyMutation.isPending}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isAuthenticated
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {applyMutation.isPending ? 'Applying...' : isAuthenticated ? t('apply') : 'Register to Apply'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading || !isAuthenticated}
            className={`p-2 rounded-lg border-2 transition-colors ${
              !isAuthenticated
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : isSaved
                ? 'bg-emerald-100 border-emerald-600 text-emerald-600'
                : 'border-gray-300 text-gray-600 hover:border-emerald-600'
            }`}
            title={!isAuthenticated ? 'Login to save' : isSaved ? 'Unsave' : 'Save for later'}
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-emerald-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default OpportunityCard
