import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Bookmark, Share2, AlertCircle, X, Users, Check } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { volunteerService } from '../../services/volunteerService'

const OpportunityModal = ({ opportunity, isOpen, onClose, onApply, onSave, onShare, isSaved, isApplying, isSaving, isAuthenticated, navigate, t }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const getModeStyle = (mode) => {
    switch (mode) {
      case 'onsite': return { bg: '#dbeafe', color: '#1d4ed8', label: 'On-site' }
      case 'remote': return { bg: '#ede9fe', color: '#7c3aed', label: 'Remote' }
      case 'hybrid': return { bg: '#ffedd5', color: '#c2410c', label: 'Hybrid' }
      default: return { bg: '#f3f4f6', color: '#374151', label: mode }
    }
  }
  const mode = getModeStyle(opportunity.mode)

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: mode.bg, color: mode.color }}>{mode.label}</span>
                {opportunity.category && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">{opportunity.category}</span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-snug">{opportunity.title}</h2>
              <p className="text-emerald-600 font-semibold text-xs sm:text-sm mt-1">{opportunity.organizationName}</p>
            </div>
            <button onClick={onClose}
              className="flex-shrink-0 p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Location', value: opportunity.location || 'Not specified' },
              { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Deadline', value: opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A' },
              { icon: <Clock className="w-3.5 h-3.5" />, label: 'Time', value: opportunity.timeCommitment || 'Flexible' },
              { icon: <Users className="w-3.5 h-3.5" />, label: 'Category', value: opportunity.category || 'General' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-2.5">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">{item.icon}<span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span></div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About this opportunity</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{opportunity.description}</p>
          </div>

          {opportunity.requirements && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requirements</h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-emerald-800 text-sm leading-relaxed whitespace-pre-line">{opportunity.requirements}</p>
              </div>
            </div>
          )}

          {opportunity.benefits && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Benefits</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{opportunity.benefits}</p>
            </div>
          )}

          {!isAuthenticated && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800"><strong>Registration required</strong> — Create a free account to apply.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100 bg-white flex gap-2.5">
          <button onClick={onApply} disabled={isApplying}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all border-none ${
              isAuthenticated
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}>
            {isApplying ? 'Applying...' : isAuthenticated ? t('apply') : 'Register to Apply'}
          </button>
          <button onClick={onSave} disabled={isSaving || !isAuthenticated}
            className={`px-3.5 py-2.5 rounded-xl border-2 transition-all ${
              !isAuthenticated ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : isSaved ? 'bg-emerald-100 border-emerald-500 text-emerald-600'
                : 'border-gray-300 text-gray-500 hover:border-emerald-500'
            }`}>
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onShare}
            className="px-3.5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

const OpportunityCard = ({ opportunity }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const { data: savedStatus, refetch: refetchSavedStatus } = useQuery({
    queryKey: ['savedStatus', opportunity.id],
    queryFn: () => volunteerService.checkIfSaved(opportunity.id),
    enabled: isAuthenticated, staleTime: 0, cacheTime: 0,
    refetchOnMount: true, refetchOnWindowFocus: true
  })

  const [isSaved, setIsSaved] = useState(false)
  useEffect(() => {
    if (savedStatus?.isSaved !== undefined) setIsSaved(savedStatus.isSaved)
    else setIsSaved(false)
  }, [savedStatus, opportunity.id])

  const saveMutation = useMutation({
    mutationFn: (oppId) => volunteerService.saveOpportunity(oppId),
    onMutate: async (oppId) => {
      await queryClient.cancelQueries(['savedStatus', oppId])
      const prev = queryClient.getQueryData(['savedStatus', oppId])
      queryClient.setQueryData(['savedStatus', oppId], { isSaved: true }); setIsSaved(true)
      return { prev }
    },
    onSuccess: (_, oppId) => {
      toast.success('Saved!')
      queryClient.invalidateQueries(['savedOpportunities'])
      queryClient.invalidateQueries(['savedStatus', oppId])
      refetchSavedStatus()
    },
    onError: (_, oppId, context) => {
      if (context?.prev) { queryClient.setQueryData(['savedStatus', oppId], context.prev); setIsSaved(context.prev?.isSaved || false) }
      else setIsSaved(false)
      toast.error('Failed to save')
    }
  })

  const unsaveMutation = useMutation({
    mutationFn: (oppId) => volunteerService.unsaveOpportunity(oppId),
    onMutate: async (oppId) => {
      await queryClient.cancelQueries(['savedStatus', oppId])
      const prev = queryClient.getQueryData(['savedStatus', oppId])
      queryClient.setQueryData(['savedStatus', oppId], { isSaved: false }); setIsSaved(false)
      return { prev }
    },
    onSuccess: (_, oppId) => {
      toast.success('Removed')
      queryClient.invalidateQueries(['savedOpportunities'])
      queryClient.invalidateQueries(['savedStatus', oppId])
      refetchSavedStatus()
    },
    onError: (_, oppId, context) => {
      if (context?.prev) { queryClient.setQueryData(['savedStatus', oppId], context.prev); setIsSaved(context.prev?.isSaved || false) }
      else setIsSaved(true)
      toast.error('Failed to remove')
    }
  })

  const applyMutation = useMutation({
    mutationFn: (oppId) => volunteerService.applyToOpportunity(oppId),
    onSuccess: () => { toast.success('Application submitted! 🎉'); queryClient.invalidateQueries(['applications']) },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to apply')
  })

  const handleSave = (e) => {
    e?.stopPropagation()
    if (!isAuthenticated) { toast.error('Please login to save'); setTimeout(() => navigate('/login'), 1500); return }
    if (isSaved) unsaveMutation.mutate(opportunity.id)
    else saveMutation.mutate(opportunity.id)
  }

  const handleApply = (e) => {
    e?.stopPropagation()
    if (!isAuthenticated) {
      toast((ti) => (
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold text-gray-900 mb-1 text-sm">Login Required</p><p className="text-xs text-gray-600">Please login or register to apply</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { toast.dismiss(ti.id); navigate('/register') }}
              className="flex-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs">Register</button>
            <button onClick={() => { toast.dismiss(ti.id); navigate('/login') }}
              className="flex-1 bg-gray-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs">Login</button>
          </div>
        </div>
      ), { duration: 6000 })
      return
    }
    applyMutation.mutate(opportunity.id)
  }

  // ── Working Share Function ──────────────────────────────────────
  const handleShare = async (e) => {
    e?.stopPropagation()

    const shareUrl = `${window.location.origin}/opportunities/${opportunity.id}`
    const shareData = {
      title: opportunity.title,
      text: `Check out this volunteer opportunity: ${opportunity.title} by ${opportunity.organizationName}`,
      url: shareUrl,
    }

    // Use native share sheet on mobile if available
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } catch (err) {
        // User cancelled — no error needed
        if (err.name !== 'AbortError') {
          toast.error('Could not share')
        }
      }
    } else {
      // Fallback: copy to clipboard on desktop
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShareCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setShareCopied(false), 2000)
      } catch {
        // Final fallback for old browsers
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
          setShareCopied(true)
          toast.success('Link copied to clipboard!')
          setTimeout(() => setShareCopied(false), 2000)
        } catch {
          toast.error('Could not copy link')
        }
        document.body.removeChild(textArea)
      }
    }
  }

  const getModeColor = (mode) => {
    switch (mode) {
      case 'onsite': return 'bg-blue-100 text-blue-800'
      case 'remote': return 'bg-purple-100 text-purple-800'
      case 'hybrid': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isLoading = saveMutation.isPending || unsaveMutation.isPending

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group border border-transparent hover:border-emerald-200 h-full flex flex-col"
      >
        <div className="p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors leading-snug">
                {opportunity.title}
              </h3>
              <p className="text-emerald-600 font-medium mb-1 text-xs sm:text-sm truncate">{opportunity.organizationName}</p>
              <div className="flex items-center text-gray-500 text-xs">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{opportunity.location}</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getModeColor(opportunity.mode)}`}>
              {t(opportunity.mode)}
            </span>
          </div>

          <p className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-2 flex-grow">{opportunity.description}</p>
          <p className="text-emerald-600 text-xs font-medium mb-3 group-hover:underline">Tap to read more →</p>

          <div className="flex items-center text-xs text-gray-500 mb-1.5">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" />
            <span>{t('deadline')}: {new Date(opportunity.deadline).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-xs text-gray-500 mb-3">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{opportunity.timeCommitment}</span>
          </div>

          {!isAuthenticated && (
            <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800"><span className="font-semibold">Note:</span> Register to apply</p>
            </div>
          )}

          <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
            <button onClick={handleApply} disabled={applyMutation.isPending}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                isAuthenticated
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}>
              {applyMutation.isPending ? '...' : isAuthenticated ? t('apply') : 'Register'}
            </button>

            <button onClick={handleSave} disabled={isLoading || !isAuthenticated}
              className={`p-2 sm:p-2.5 rounded-lg border-2 transition-colors ${
                !isAuthenticated ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : isSaved ? 'bg-emerald-100 border-emerald-600 text-emerald-600'
                  : 'border-gray-300 text-gray-500 hover:border-emerald-600'
              }`}
              title={!isAuthenticated ? 'Login to save' : isSaved ? 'Unsave' : 'Save'}>
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            <button onClick={handleShare}
              className={`p-2 sm:p-2.5 rounded-lg border-2 transition-colors ${
                shareCopied
                  ? 'bg-blue-100 border-blue-500 text-blue-600'
                  : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'
              }`}
              title="Share this opportunity">
              {shareCopied
                ? <Check className="w-4 h-4" />
                : <Share2 className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      </div>

      <OpportunityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        opportunity={opportunity}
        onApply={handleApply}
        onSave={handleSave}
        onShare={handleShare}
        isSaved={isSaved}
        isApplying={applyMutation.isPending}
        isSaving={isLoading}
        isAuthenticated={isAuthenticated}
        navigate={navigate}
        t={t}
      />
    </>
  )
}

export default OpportunityCard
