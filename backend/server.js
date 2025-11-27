import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cron from 'node-cron'
import session from 'express-session'
import passport from './src/config/passport.js'
import app from './src/app.js'
import { sequelize } from './src/config/database.js'
import { checkExpiredDeadlines } from './src/jobs/deadlineChecker.js'

dotenv.config()

const PORT = process.env.PORT || 5000

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connected successfully')
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      console.log('✅ Database models synchronized')
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Initialize server
const startServer = async () => {
  await connectDB()
  
  // Session configuration for passport
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }))
  
  // Initialize passport
  app.use(passport.initialize())
  app.use(passport.session())
  
  // Schedule cron job to check expired deadlines every day at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('Running deadline checker...')
    checkExpiredDeadlines()
  })
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

startServer()

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err)
  process.exit(1)
})
