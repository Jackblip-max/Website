import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { register, login, getProfile, updateProfile, completeProfile, checkEmailAvailability } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/check-email', checkEmailAvailability)
router.post('/register', register)
router.post('/login', login)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.post('/complete-profile', authenticate, completeProfile)

// Profile photo upload
router.post('/profile-photo', authenticate, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const photoPath = `/uploads/photos/${req.file.filename}`
    
    // Update user's profile photo in database
    await req.user.update({ profilePhoto: photoPath })

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      photoUrl: photoPath
    })
  } catch (error) {
    console.error('Upload photo error:', error)
    res.status(500).json({ message: 'Failed to upload photo', error: error.message })
  }
})

// Google OAuth routes
router.get('/google',
  (req, res, next) => {
    console.log('Initiating Google OAuth flow')
    next()
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
)

router.get('/google/callback',
  (req, res, next) => {
    console.log('Google callback route hit')
    next()
  },
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      console.log('Google OAuth successful, generating JWT')
      console.log('User:', req.user?.email)
      
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      )

      // Check if user needs to complete profile
      // User needs profile if they don't have phone number
      const needsProfile = !req.user.phone
      
      console.log('User needs profile completion:', needsProfile)
      console.log('User has phone:', !!req.user.phone)
      
      // Redirect to frontend with token and profile completion flag
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&needsProfile=${needsProfile}`
      console.log('Redirecting to:', redirectUrl)
      
      res.redirect(redirectUrl)
    } catch (error) {
      console.error('Error in Google callback:', error)
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=server_error`)
    }
  }
)

export default router
