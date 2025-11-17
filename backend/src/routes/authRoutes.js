import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { register, login, getProfile, updateProfile } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)

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

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`)
  }
)

export default router
