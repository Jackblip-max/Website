import axios from 'axios'

const OLLAMA_API = 'http://localhost:11434/api/generate'
const OLLAMA_TAGS_API = 'http://localhost:11434/api/tags'

/**
 * Generate opportunity description using Ollama (Local LLM)
 */
export const generateOpportunityDescription = async (opportunityData) => {
  const { title, category, location, mode, requirements, timeCommitment } = opportunityData

  const prompt = `You are a professional volunteer coordinator. Generate a compelling and engaging volunteer opportunity description.

**Details:**
- Title: ${title}
- Category: ${category}
- Location: ${location}
- Mode: ${mode}
- Time Commitment: ${timeCommitment || 'Flexible'}
- Requirements: ${requirements}

**Instructions:**
Write a 2-3 paragraph description (150-200 words) that:
1. Opens with an inspiring hook about the impact
2. Clearly explains what volunteers will do
3. Naturally mentions the requirements
4. Ends with a motivating call-to-action
5. Uses professional but warm tone
6. Focuses on the positive impact volunteers will make

Write ONLY the description, no extra commentary.`

  try {
    console.log('🤖 Generating description with Ollama...')
    console.log('📝 Title:', title)
    console.log('📍 Location:', location)
    
    const response = await axios.post(OLLAMA_API, {
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 300
      }
    }, {
      timeout: 60000 // 60 second timeout for generation
    })

    const generatedText = response.data.response.trim()
    
    console.log('✅ Description generated successfully')
    console.log('📊 Length:', generatedText.length, 'characters')
    
    return generatedText

  } catch (error) {
    console.error('❌ Ollama generation error:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Ollama is not running. Please start it with: ollama serve')
    }
    
    // Fallback to template-based generation
    console.log('⚠️  Falling back to template-based generation')
    return generateTemplateDescription(opportunityData)
  }
}

/**
 * Fallback template-based description generator
 */
const generateTemplateDescription = (data) => {
  const { title, category, location, mode, requirements, timeCommitment } = data
  
  const categoryDescriptions = {
    environment: 'environmental conservation and sustainability',
    education: 'education and community empowerment',
    healthcare: 'healthcare and wellness',
    community: 'community development and social impact',
    animals: 'animal welfare and protection',
    arts: 'arts and cultural preservation'
  }

  const impactPhrase = categoryDescriptions[category] || 'making a positive difference'

  return `Join us for an exciting opportunity to contribute to ${impactPhrase}! We are looking for dedicated volunteers for "${title}" in ${location}.

This ${mode} position offers a unique chance to make a real impact in our community. ${timeCommitment ? `The time commitment is ${timeCommitment}, ` : ''}making it perfect for those who want to give back while maintaining flexibility. 

Requirements: ${requirements}

Ready to make a difference? Apply now and be part of something meaningful! Your contribution will help create lasting positive change in our community. Together, we can build a better future.`
}

/**
 * Generate multiple description variations
 */
export const generateDescriptionVariations = async (opportunityData) => {
  const tones = [
    { name: 'professional', temp: 0.5 },
    { name: 'friendly', temp: 0.8 },
    { name: 'urgent', temp: 0.9 }
  ]

  try {
    console.log('🎨 Generating description variations...')
    
    const variations = await Promise.all(
      tones.map(async (tone) => {
        const prompt = `Write a ${tone.name} tone volunteer opportunity description for: ${opportunityData.title}. Category: ${opportunityData.category}. Location: ${opportunityData.location}. Keep it 150-200 words.`
        
        try {
          const response = await axios.post(OLLAMA_API, {
            model: 'llama3.2',
            prompt: prompt,
            stream: false,
            options: { 
              temperature: tone.temp,
              num_predict: 250
            }
          }, {
            timeout: 60000
          })

          return {
            tone: tone.name,
            description: response.data.response.trim()
          }
        } catch (err) {
          console.error(`❌ Failed to generate ${tone.name} variation:`, err.message)
          return {
            tone: tone.name,
            description: generateTemplateDescription(opportunityData)
          }
        }
      })
    )

    console.log('✅ Generated', variations.length, 'variations')
    return variations
    
  } catch (error) {
    console.error('❌ Error generating variations:', error.message)
    return [{
      tone: 'professional',
      description: generateTemplateDescription(opportunityData)
    }]
  }
}

/**
 * Improve existing description
 */
export const improveDescription = async (currentDescription, feedback) => {
  const prompt = `Improve this volunteer opportunity description based on the feedback:

Current Description:
${currentDescription}

Feedback: ${feedback}

Write an improved version that addresses the feedback while maintaining professionalism and engagement. Keep it 150-200 words.`

  try {
    console.log('✨ Improving description...')
    
    const response = await axios.post(OLLAMA_API, {
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 300
      }
    }, {
      timeout: 60000
    })

    console.log('✅ Description improved')
    return response.data.response.trim()
    
  } catch (error) {
    console.error('❌ Error improving description:', error.message)
    return currentDescription
  }
}

/**
 * Check if Ollama is running and available
 */
export const checkOllamaStatus = async () => {
  try {
    console.log('🔍 Checking Ollama status at:', OLLAMA_TAGS_API)
    
    const response = await axios.get(OLLAMA_TAGS_API, {
      timeout: 5000,
      validateStatus: (status) => status === 200
    })
    
    console.log('✅ Ollama is running!')
    
    const models = response.data.models || []
    console.log('📊 Available models:', models.length)
    
    if (models.length > 0) {
      console.log('🤖 Models found:')
      models.forEach(model => {
        console.log(`   - ${model.name} (${(model.size / 1e9).toFixed(2)} GB)`)
      })
    }
    
    const hasLlama = models.some(m => m.name && m.name.toLowerCase().includes('llama'))
    console.log('✓ Has Llama model:', hasLlama)
    
    return {
      available: true,
      models: models.map(m => m.name),
      hasLlama,
      modelCount: models.length
    }
    
  } catch (error) {
    console.error('❌ Ollama status check failed')
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Ollama is not running')
      console.error('   → Start it with: ollama serve')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Connection timed out')
      console.error('   → Ollama might be starting up, try again')
    } else {
      console.error('   → Error:', error.message)
    }
    
    return {
      available: false,
      error: 'Ollama is not running. Please start Ollama service.',
      errorCode: error.code,
      errorMessage: error.message
    }
  }
}

export default {
  generateOpportunityDescription,
  generateDescriptionVariations,
  improveDescription,
  checkOllamaStatus
}
