import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { User, Volunteer } from '../models/index.js'
import dotenv from 'dotenv'

dotenv.config()

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
        console.log('Google OAuth callback received for:', profile.emails[0].value)
        
        // Check if user already exists with Google ID
        let user = await User.findOne({ 
          where: { googleId: profile.id },
          include: [{ model: Volunteer, as: 'volunteer' }]
        })

        if (user) {
          console.log('Existing user found:', user.email)
          return done(null, user)
        }

        // Check if user exists with same email
        user = await User.findOne({ 
          where: { email: profile.emails[0].value },
          include: [{ model: Volunteer, as: 'volunteer' }]
        })

        if (user) {
          // Link Google account to existing user
          console.log('Linking Google account to existing user:', user.email)
          user.googleId = profile.id
          await user.save()
          return done(null, user)
        }

        // Create new user
        console.log('Creating new user:', profile.emails[0].value)
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          role: 'volunteer',
          isVerified: true
        })

        // Create volunteer profile with default values
        await Volunteer.create({
          userId: user.id,
          education: 'undergraduate',
          skills: '',
          teamwork: true,
          motivation: '',
          notificationsEnabled: true
        })

        // Fetch user with volunteer data
        user = await User.findByPk(user.id, {
          include: [{ model: Volunteer, as: 'volunteer' }]
        })

        console.log('New user created successfully:', user.email)
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
  done(null, user.id)
})

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      include: [{ model: Volunteer, as: 'volunteer' }]
    })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

export default passport
