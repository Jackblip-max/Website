import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { User, Volunteer } from '../models/index.js'
import dotenv from 'dotenv'

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
        
        user = await User.create({
          name: displayName,
          email,
          googleId: profile.id,
          role: 'volunteer',
          isVerified: true,
          phone: null  // Will need to be filled later
        })

        console.log('New user created with ID:', user.id)

        // Create volunteer profile with default values
        await Volunteer.create({
          userId: user.id,
          education: 'undergraduate',
          skills: '',
          teamwork: true,
          motivation: '',
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
