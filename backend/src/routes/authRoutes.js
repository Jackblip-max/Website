import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { register, login, getProfile, updateProfile, completeProfile } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

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
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
)

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`,
    session: false 
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    // Check if user needs to complete profile (for Google OAuth users)
    const needsProfile = !req.user.phone || !req.user.volunteer?.education
    
    // Redirect to frontend with token and profile completion flag
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&needsProfile=${needsProfile}`
    res.redirect(redirectUrl)
  }
)

export default router
