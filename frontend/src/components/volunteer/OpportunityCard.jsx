import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Bookmark, Share2, AlertCircle, X, Tag, Users, Building2 } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { volunteerService } from '../../services/volunteerService'

// ── Detail Modal ───────────────────────────────────────────────────
const OpportunityModal = ({ opportunity, isOpen, onClose, onApply, onSave, isSaved, isApplying, isSaving, isAuthenticated, navigate, t }) => {
  if (!isOpen) return null

  const getModeColor = (mode) => {

    switch (mode) {
      case 'onsite': return { bg: '#dbeafe', color: '#1d4ed8', label: 'On-site' }
      case 'remote': return { bg: '#ede9fe', color: '#7c3aed', label: 'Remote' }
      case 'hybrid': return { bg: '#ffedd5', color: '#c2410c', label: 'Hybrid' }
      default: return { bg: '#f3f4f6', color: '#374151', label: mode }
    }
  }
  const mode = getModeColor(opportunity.mode)

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 0', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: mode.bg, color: mode.color }}>
                  {mode.label}
                </span>
                {opportunity.category && (
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#d1fae5', color: '#065f46' }}>
                    {opportunity.category}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.4px' }}>
                {opportunity.title}
              </h2>
              <p style={{ color: '#059669', fontWeight: 600, margin: '4px 0 0', fontSize: 14 }}>
                {opportunity.organizationName}
              </p>
            </div>
            <button onClick={onClose}
              style={{ flexShrink: 0, padding: 8, borderRadius: 10, border: 'none', background: '#f3f4f6', cursor: 'pointer', color: '#6b7280' }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

          {/* Meta info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { icon: <MapPin style={{ width: 15, height: 15 }} />, label: 'Location', value: opportunity.location || 'Not specified' },
              { icon: <Calendar style={{ width: 15, height: 15 }} />, label: 'Deadline', value: opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
              { icon: <Clock style={{ width: 15, height: 15 }} />, label: 'Time Commitment', value: opportunity.timeCommitment || 'Flexible' },
              { icon: <Users style={{ width: 15, height: 15 }} />, label: 'Category', value: opportunity.category || 'General' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', marginBottom: 3 }}>
                  {item.icon}
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>About this opportunity</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: 14, margin: 0, whiteSpace: 'pre-line' }}>
              {opportunity.description}
            </p>
          </div>

          {/* Requirements */}
          {opportunity.requirements && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requirements</h3>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ color: '#166534', lineHeight: 1.7, fontSize: 14, margin: 0, whiteSpace: 'pre-line' }}>
                  {opportunity.requirements}
                </p>
              </div>
            </div>
          )}

          {/* Benefits */}
          {opportunity.benefits && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Benefits</h3>
              <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: 14, margin: 0, whiteSpace: 'pre-line' }}>
                {opportunity.benefits}
              </p>
            </div>
          )}

          {/* Not authenticated warning */}
          {!isAuthenticated && (
            <div style={{ marginBottom: 8, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle style={{ width: 16, height: 16, color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
                <strong>Registration required</strong> — Create a free account to apply for volunteer opportunities.
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky action footer ── */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', background: '#fff', borderRadius: '0 0 20px 20px', display: 'flex', gap: 10 }}>
          <button
            onClick={() => { onApply(); }}
            disabled={isApplying}
            style={{
              flex: 1, padding: '13px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 15, cursor: isApplying ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              background: isAuthenticated ? 'linear-gradient(135deg, #059669, #0d9488)' : '#f59e0b',
              color: '#fff', opacity: isApplying ? 0.7 : 1,
              boxShadow: isAuthenticated ? '0 4px 16px rgba(5,150,105,0.3)' : 'none'
            }}>
            {isApplying ? 'Applying...' : isAuthenticated ? t('apply') : 'Register to Apply'}
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !isAuthenticated}
            style={{
              padding: '13px 16px', borderRadius: 12, border: `2px solid ${isSaved ? '#059669' : '#e5e7eb'}`,
              background: isSaved ? '#d1fae5' : '#fff', color: isSaved ? '#059669' : '#6b7280',
              cursor: (!isAuthenticated || isSaving) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
            }}
            title={!isAuthenticated ? 'Login to save' : isSaved ? 'Unsave' : 'Save for later'}>
            <Bookmark style={{ width: 20, height: 20 }} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Card ───────────────────────────────────────────────────────────
const OpportunityCard = ({ opportunity }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: savedStatus, refetch: refetchSavedStatus } = useQuery({
    queryKey: ['savedStatus', opportunity.id],
    queryFn: async () => {
      const result = await volunteerService.checkIfSaved(opportunity.id)
      return result
    },
    enabled: isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (savedStatus?.isSaved !== undefined) {
      setIsSaved(savedStatus.isSaved)
    } else {
      setIsSaved(false)
    }
  }, [savedStatus, opportunity.id])

  const saveMutation = useMutation({
    mutationFn: (oppId) => volunteerService.saveOpportunity(oppId),
    onMutate: async (oppId) => {
      await queryClient.cancelQueries(['savedStatus', oppId])
      const previousStatus = queryClient.getQueryData(['savedStatus', oppId])
      queryClient.setQueryData(['savedStatus', oppId], { isSaved: true })
      setIsSaved(true)
      return { previousStatus }
    },
    onSuccess: (data, oppId) => {
      toast.success('Saved successfully!')
      queryClient.invalidateQueries(['savedOpportunities'])
      queryClient.invalidateQueries(['savedStatus', oppId])
      refetchSavedStatus()
    },
    onError: (error, oppId, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(['savedStatus', oppId], context.previousStatus)
        setIsSaved(context.previousStatus?.isSaved || false)
      } else {
        setIsSaved(false)
      }
      toast.error(error.response?.data?.message || 'Failed to save opportunity')
    }
  })

  const unsaveMutation = useMutation({
    mutationFn: (oppId) => volunteerService.unsaveOpportunity(oppId),
    onMutate: async (oppId) => {
      await queryClient.cancelQueries(['savedStatus', oppId])
      const previousStatus = queryClient.getQueryData(['savedStatus', oppId])
      queryClient.setQueryData(['savedStatus', oppId], { isSaved: false })
      setIsSaved(false)
      return { previousStatus }
    },
    onSuccess: (data, oppId) => {
      toast.success('Removed from saved')
      queryClient.invalidateQueries(['savedOpportunities'])
      queryClient.invalidateQueries(['savedStatus', oppId])
      refetchSavedStatus()
    },
    onError: (error, oppId, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(['savedStatus', oppId], context.previousStatus)
        setIsSaved(context.previousStatus?.isSaved || false)
      } else {
        setIsSaved(true)
      }
      toast.error(error.response?.data?.message || 'Failed to remove opportunity')
    }
  })

  const applyMutation = useMutation({
    mutationFn: (oppId) => volunteerService.applyToOpportunity(oppId),
    onSuccess: () => {
      toast.success('Application submitted successfully! 🎉')
      queryClient.invalidateQueries(['applications'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit application')
    }
  })

  const handleSave = (e) => {
    e?.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to save opportunities')
      setTimeout(() => navigate('/login'), 1500)
      return
    }
    if (isSaved) unsaveMutation.mutate(opportunity.id)
    else saveMutation.mutate(opportunity.id)
  }

  const handleApply = (e) => {
    e?.stopPropagation()
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
            <button onClick={() => { toast.dismiss(toastInstance.id); navigate('/register') }}
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium">
              Create Account
            </button>
            <button onClick={() => { toast.dismiss(toastInstance.id); navigate('/login') }}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium">
              Login
            </button>
          </div>
        </div>
      ), { duration: 6000, style: { minWidth: '350px', maxWidth: '450px' } })
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
      {/* ── Card ── */}
      <div
        onClick={() => setModalOpen(true)}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
        style={{ border: '1px solid transparent' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#d1fae5'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {opportunity.title}
              </h3>
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

          {/* Description — 2 lines, click card to see full */}
          <p className="text-gray-600 text-sm mb-1 line-clamp-2">{opportunity.description}</p>
          <p className="text-emerald-600 text-xs font-medium mb-4 group-hover:underline">Click to read more →</p>

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

          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={handleApply}
              disabled={applyMutation.isPending}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isAuthenticated
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}>
              {applyMutation.isPending ? 'Applying...' : isAuthenticated ? t('apply') : 'Register to Apply'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !isAuthenticated}
              className={`p-2 rounded-lg border-2 transition-colors ${
                !isAuthenticated ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : isSaved ? 'bg-emerald-100 border-emerald-600 text-emerald-600'
                : 'border-gray-300 text-gray-600 hover:border-emerald-600'
              }`}
              title={!isAuthenticated ? 'Login to save' : isSaved ? 'Unsave' : 'Save for later'}>
              <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-emerald-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <OpportunityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        opportunity={opportunity}
        onApply={handleApply}
        onSave={handleSave}
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
