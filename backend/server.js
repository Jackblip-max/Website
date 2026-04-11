import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cron from 'node-cron'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import passport from './src/config/passport.js'
import { sequelize } from './src/config/database.js'
import { checkExpiredDeadlines, sendDeadlineReminders } from './src/jobs/deadlineChecker.js'
import routes from './src/routes/index.js'
import { errorHandler } from './src/middleware/errorHandler.js'
import analysisRoutes from './src/routes/analysisRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 5000
const app = express()

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/analysis', analysisRoutes)

// Session configuration - MUST BE BEFORE passport initialization
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
}))

// Initialize passport - MUST BE AFTER session
app.use(passport.initialize())
app.use(passport.session())

// Static files - CRITICAL for logo display
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Add logging for static file requests
app.use('/uploads', (req, res, next) => {
  console.log('📁 Static file request:', req.url)
  next()
})

// Routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Error handling
app.use(errorHandler)

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connected successfully')
    
    // Don't use sync in production - use migrations instead
    // For development, only sync if explicitly needed
    if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: false, force: false })
      console.log('✅ Database models synchronized')
    } else {
      console.log('⚠️  Database sync disabled. Use migrations for schema changes.')
      console.log('   Set SYNC_DB=true in .env if you need to sync models')
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Initialize server
const startServer = async () => {
  await connectDB()
  
  // Schedule cron job to send deadline reminders every day at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('🔔 Running deadline reminder checker...')
    sendDeadlineReminders()
  })
  
  // Schedule cron job to check expired deadlines every day at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('🕐 Running expired deadline checker...')
    checkExpiredDeadlines()
  })
  
  console.log('✅ Cron jobs scheduled:')
  console.log('   - Deadline reminders: Every day at 9:00 AM')
  console.log('   - Expired deadlines: Every day at 12:00 AM')
  
  console.log('📁 Static files directory:', path.join(__dirname, 'uploads'))
  console.log('📁 Uploads accessible at: http://localhost:' + PORT + '/uploads/')
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔐 Google OAuth callback: ${process.env.GOOGLE_CALLBACK_URL}`)
  })
}

startServer()

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err)
  process.exit(1)
})
