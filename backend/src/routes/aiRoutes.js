import express from 'express'
import { 
  generateOpportunityDescription, 
  generateDescriptionVariations,
  improveDescription,
  checkOllamaStatus 
} from '../services/aiService.js'
import { authenticate, requireOrganization } from '../middleware/auth.js'

const router = express.Router()

// Check if AI service (Ollama) is available
router.get('/status', authenticate, async (req, res) => {
  try {
    const status = await checkOllamaStatus()
    res.json({
      success: true,
      ...status
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service status',
      error: error.message
    })
  }
})

// Generate opportunity description
router.post('/generate-description', authenticate, requireOrganization, async (req, res) => {
  try {
    const { title, category, location, mode, requirements, timeCommitment } = req.body

    // Validation
    if (!title || !category || !location || !mode || !requirements) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, location, mode, requirements'
      })
    }

    console.log('📝 Generating description for:', title)

    const description = await generateOpportunityDescription({
      title,
      category,
      location,
      mode,
      requirements,
      timeCommitment
    })

    res.json({
      success: true,
      description,
      message: 'Description generated successfully'
    })

  } catch (error) {
    console.error('Generate description error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate description',
      error: error.message
    })
  }
})

// Generate multiple variations
router.post('/generate-variations', authenticate, requireOrganization, async (req, res) => {
  try {
    const opportunityData = req.body

    console.log('📝 Generating description variations...')

    const variations = await generateDescriptionVariations(opportunityData)

    res.json({
      success: true,
      variations,
      message: 'Variations generated successfully'
    })

  } catch (error) {
    console.error('Generate variations error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate variations',
      error: error.message
    })
  }
})

// Improve existing description
router.post('/improve-description', authenticate, requireOrganization, async (req, res) => {
  try {
    const { currentDescription, feedback } = req.body

    if (!currentDescription) {
      return res.status(400).json({
        success: false,
        message: 'Current description is required'
      })
    }

    console.log('✨ Improving description...')

    const improvedDescription = await improveDescription(
      currentDescription,
      feedback || 'Make it more engaging and professional'
    )

    res.json({
      success: true,
      description: improvedDescription,
      message: 'Description improved successfully'
    })

  } catch (error) {
    console.error('Improve description error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to improve description',
      error: error.message
    })
  }
})

export default router
