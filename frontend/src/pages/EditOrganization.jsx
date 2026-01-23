import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Save, X, Upload, Building2, Loader } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { organizationService } from '../services/organizationService'

const EditOrganization = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactDetails: ''
  })

  // Fetch organization details
  const { data: organization, isLoading } = useQuery({
    queryKey: ['myOrganization'],
    queryFn: organizationService.getMyOrganization
  })

  // Initialize form data when organization loads
  useEffect(() => {
    if (organization?.data) {
      const orgData = organization.data
      setFormData({
        name: orgData.name || '',
        description: orgData.description || '',
        contactDetails: orgData.contactDetails || ''
      })
      if (orgData.logo) {
        setLogoPreview(orgData.logo)
      }
    }
  }, [organization])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const orgData = organization?.data || organization
      return await organizationService.updateOrganization(orgData.id, data)
    },
    onSuccess: () => {
      toast.success('Organization updated successfully!')
      queryClient.invalidateQueries(['myOrganization'])
      navigate('/org-dashboard')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update organization')
    }
  })

  // Logo upload mutation
  const logoMutation = useMutation({
    mutationFn: (file) => organizationService.uploadLogo(file),
    onSuccess: () => {
      toast.success('Logo uploaded successfully!')
      queryClient.invalidateQueries(['myOrganization'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload logo')
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Organization name is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!formData.contactDetails.trim()) {
      toast.error('Contact details are required')
      return
    }

    // Upload logo first if there's a new one
    if (logoFile) {
      try {
        await logoMutation.mutateAsync(logoFile)
      } catch (error) {
        console.error('Logo upload error:', error)
        // Continue with organization update even if logo fails
      }
    }

    // Update organization details
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    navigate('/org-dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-900">Edit Organization</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Logo
              </label>
              <div className="flex items-center gap-4">
                {/* Logo Preview */}
                <div className="relative">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Organization logo"
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl">
                      {formData.name?.charAt(0) || 'O'}
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {logoFile ? logoFile.name : 'Choose new logo'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Green Earth Foundation"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Contact Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Details <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleChange}
                placeholder="Email, Phone, Address"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide multiple contact methods for volunteers to reach you
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Organization <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your organization's mission, vision, and impact..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows="6"
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={updateMutation.isPending || logoMutation.isPending}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {updateMutation.isPending || logoMutation.isPending ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateMutation.isPending || logoMutation.isPending}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditOrganization
