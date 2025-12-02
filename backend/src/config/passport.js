import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { User, Volunteer } from '../models/index.js'
import { sendVerificationEmail } from '../services/emailService.js'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

dotenv.config()

console.log('Initializing Passport with Google OAuth')
console.log('Client ID exists:', !!process.env.GOOGLE_CLIENT_ID)
console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL)

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth callback received')
        console.log('Profile email:', profile.emails?.[0]?.value)
        console.log('Profile ID:', profile.id)
        
        const email = profile.emails?.[0]?.value
        
        if (!email) {
          console.error('No email in Google profile')
          return done(new Error('No email provided by Google'), null)
        }
        
        // Check if user already exists with Google ID
        let user = await User.findOne({ 
          where: { googleId: profile.id },
          include: [{ model: Volunteer, as: 'volunteer' }]
        })

        if (user) {
          console.log('Existing user found with Google ID:', user.email)
          return done(null, user)
        }

        // Check if user exists with same email
        user = await User.findOne({ 
          where: { email },
          include: [{ model: Volunteer, as: 'volunteer' }]
        })

        if (user) {
          // Link Google account to existing user
          console.log('Linking Google account to existing user:', user.email)
          user.googleId = profile.id
          
          // Set name from Google if not already set
          if (!user.name || user.name === email.split('@')[0]) {
            user.name = profile.displayName || profile.emails?.[0]?.value.split('@')[0]
          }
          
          // If user doesn't have a password (was created via Google), set a random one
          // so they can login with email/password later if they want
          if (!user.password) {
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(randomPassword, salt)
            console.log('Set random password for Google user to enable email/password login')
          }
          
          await user.save()
          
          // Reload user with associations
          user = await User.findByPk(user.id, {
            include: [{ model: Volunteer, as: 'volunteer' }]
          })
          
          return done(null, user)
        }

        // Create new user with Google profile info
        console.log('Creating new user:', email)
        
        // Extract name from Google profile - use displayName which is more complete
        const displayName = profile.displayName || email.split('@')[0]
        
        // Generate a random password so user can login with email/password later
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(randomPassword, salt)
        
        user = await User.create({
          name: displayName,
          email,
          googleId: profile.id,
          password: hashedPassword,  // Set password for future email/password login
          role: 'volunteer',
          isVerified: true,
          phone: null  // Will need to be filled later
        })

        console.log('New user created with ID:', user.id)
        console.log('User can now login with email/password')

        // Create volunteer profile with default values
        await Volunteer.create({
          userId: user.id,
          education: 'undergraduate',
          skills: '',
          notificationsEnabled: true
        })

        console.log('Volunteer profile created for user:', user.id)

        // Fetch user with volunteer data
        user = await User.findByPk(user.id, {
          include: [{ model: Volunteer, as: 'volunteer' }]
        })

        console.log('New user setup complete:', user.email)
        return done(null, user)
      } catch (error) {
        console.error('Google OAuth error:', error)
        return done(error, null)
      }
    }
  )
)

// Serialize user for the session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id)
  done(null, user.id)
})

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user:', id)
    const user = await User.findByPk(id, {
      include: [{ model: Volunteer, as: 'volunteer' }]
    })
    
    if (!user) {
      console.error('User not found during deserialization:', id)
      return done(new Error('User not found'), null)
    }
    
    done(null, user)
  } catch (error) {
    console.error('Deserialization error:', error)
    done(error, null)
  }
})

export default passport
