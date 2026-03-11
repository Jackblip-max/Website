// backend/src/controllers/authController.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Op } from 'sequelize'
import { User, Volunteer, Organization } from '../models/index.js'
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js'
import sequelize from '../config/database.js'

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// @desc    Validate email existence
// @route   POST /api/auth/validate-email
// @access  Public
export const validateEmailExistence = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    console.log('🔍 Validating email existence:', email)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid email format'
      })
    }

    const validation = await validateGmailAccount(email)
    
    console.log('📧 Email validation result:', validation)

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: validation.message || 'Email validation failed'
      })
    }

    res.json({
      success: true,
      valid: true,
      message: validation.message
    })
  } catch (error) {
    console.error('❌ Email validation error:', error)
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Failed to validate email'
    })
  }
}

// @desc    Check if email is available
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    const existingUser = await User.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    })

    res.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'Email is already registered' : 'Email is available'
    })
  } catch (error) {
    console.error('Check email error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check email availability'
    })
  }
}

// @desc    Check if name is available
// @route   POST /api/auth/check-name
// @access  Public
export const checkNameAvailability = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      })
    }

    const trimmedName = name.trim()
    
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      })
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: 'Name can only contain letters and spaces'
      })
    }

    const existingUser = await User.findOne({ 
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        sequelize.fn('LOWER', trimmedName)
      )
    })

    res.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'This name is already taken' : 'Name is available'
    })
  } catch (error) {
    console.error('Check name error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check name availability'
    })
  }
}

// @desc    Check if phone is available
// @route   POST /api/auth/check-phone
// @access  Public
export const checkPhoneAvailability = async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      })
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^(\+?95|0?9)\d{7,10}$/
    
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      })
    }

    const existingUser = await User.findOne({ 
      where: { phone: cleanPhone } 
    })

    res.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'This phone number is already registered' : 'Phone number is available'
    })
  } catch (error) {
    console.error('Check phone error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check phone availability'
    })
  }
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('📝 Registration request received:', { ...req.body, password: '***' })
    
    const { 
      name, 
      email, 
      phone, 
      password, 
      education,
      skills,
      preferredCategories,
      preferredModes
    } = req.body

    if (!name || !email || !phone || !password) {
      console.log('❌ Missing required fields')
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, phone, and password' 
      })
    }

    const trimmedName = name.trim()
    
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      })
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: 'Name can only contain letters and spaces'
      })
    }

    const nameExists = await User.findOne({ 
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        sequelize.fn('LOWER', trimmedName)
      )
    })
    
    if (nameExists) {
      console.log('❌ Name already exists:', trimmedName)
      return res.status(400).json({ 
        success: false,
        message: 'This name is already taken. Please choose a different name.' 
      })
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^(\+?95|0?9)\d{7,10}$/
    if (!phoneRegex.test(cleanPhone)) {
      console.log('❌ Invalid phone format:', phone)
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid Myanmar phone number (e.g., 09xxxxxxxxx or +959xxxxxxxxx)' 
      })
    }

    const phoneExists = await User.findOne({ where: { phone: cleanPhone } })
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered'
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email)
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    const userExists = await User.findOne({ where: { email: email.trim().toLowerCase() } })
    if (userExists) {
      console.log('❌ User already exists:', email)
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      })
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase || !hasLowerCase) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain both uppercase and lowercase letters'
      })
    }

    if (!hasNumbers) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      })
    }

    if (!hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character (!@#$%^&*...)'
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    console.log('✅ Password hashed successfully')

    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = await User.create({
      name: trimmedName,
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password: hashedPassword,
      role: 'volunteer',
      isVerified: false,
      verificationToken: verificationToken,
      verificationExpires: verificationExpires
    })

    console.log('✅ User created successfully:', user.id)

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken)
      console.log('✅ Verification email sent successfully to:', user.email)
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError)
      await user.destroy()
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please check your email address and try again.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      })
    }

    await Volunteer.create({
      userId: user.id,
      education: education || 'undergraduate',
      skills: skills || '',
      preferredCategories: preferredCategories || [],
      preferredModes: preferredModes || [],
      notificationsEnabled: true
    })

    console.log('✅ Volunteer profile created successfully with preferences')

    const token = generateToken(user.id)

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      volunteer: {
        education: education || 'undergraduate',
        skills: skills || '',
        preferredCategories: preferredCategories || [],
        preferredModes: preferredModes || [],
        notificationsEnabled: true
      }
    }

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'Registration successful! Please check your email to verify your account before logging in.'
    })
  } catch (error) {
    console.error('❌ Register error details:', error)
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email })
    
    const { email, password } = req.body

    if (!email || !password) {
      console.log('❌ Missing credentials')
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      })
    }

    console.log('🔍 Searching for user:', email.trim().toLowerCase())
    const user = await User.findOne({ 
      where: { email: email.trim().toLowerCase() },
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ]
    })

    if (!user) {
      console.log('❌ User not found')
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    // ✅ Block admin accounts from the user login endpoint.
    // Return the same generic 401 as "user not found" — no information leakage.
    if (user.role === 'admin') {
      console.log('❌ Admin account attempted user login:', user.email)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    console.log('✅ User found:', user.id)
    console.log('📧 User verified status:', user.isVerified)
    console.log('🏢 Has organization:', !!user.organization)

    if (!user.password) {
      console.log('❌ User has no password')
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    console.log('🔐 Comparing passwords...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('🔐 Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password')
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    if (!user.isVerified) {
      console.log('❌ User email not verified:', user.email)
      return res.status(403).json({ 
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        email: user.email
      })
    }

    console.log('✅ Password validated successfully')
    console.log('✅ User is verified')

    const token = generateToken(user.id)
    console.log('✅ Token generated')

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      volunteer: user.volunteer ? {
        id: user.volunteer.id,
        education: user.volunteer.education,
        skills: user.volunteer.skills,
        preferredCategories: user.volunteer.preferredCategories || [],
        preferredModes: user.volunteer.preferredModes || [],
        notificationsEnabled: user.volunteer.notificationsEnabled
      } : null,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        description: user.organization.description,
        contactDetails: user.organization.contactDetails,
        logo: user.organization.logo,
        isVerified: user.organization.isVerified
      } : null,
      organizationId: user.organization?.id || null
    }

    console.log('✅ Login successful for user:', user.id)

    res.json({
      success: true,
      token,
      user: userResponse
    })
  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    console.log('📋 Getting profile for user:', req.user.id)
    
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ],
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    res.json({
      success: true,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      volunteer: user.volunteer ? {
        id: user.volunteer.id,
        education: user.volunteer.education,
        skills: user.volunteer.skills,
        preferredCategories: user.volunteer.preferredCategories || [],
        preferredModes: user.volunteer.preferredModes || [],
        notificationsEnabled: user.volunteer.notificationsEnabled
      } : null,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        description: user.organization.description,
        contactDetails: user.organization.contactDetails,
        logo: user.organization.logo,
        isVerified: user.organization.isVerified
      } : null,
      organizationId: user.organization?.id || null
    })
  } catch (error) {
    console.error('❌ Get profile error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get profile',
      error: error.message 
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      education, 
      skills, 
      notificationsEnabled,
      preferredCategories,
      preferredModes
    } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters'
        })
      }
      user.name = name.trim()
    }
    
    if (phone) {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
      const phoneRegex = /^(\+?95|0?9)\d{7,10}$/
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid Myanmar phone number'
        })
      }
      user.phone = cleanPhone
    }
    
    await user.save()

    if (user.role === 'volunteer') {
      const volunteer = await Volunteer.findOne({ where: { userId: user.id } })
      if (volunteer) {
        const updateData = {
          education: education || volunteer.education,
          skills: skills !== undefined ? skills : volunteer.skills,
          notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : volunteer.notificationsEnabled
        }

        if (preferredCategories !== undefined) {
          updateData.preferredCategories = preferredCategories
        }
        if (preferredModes !== undefined) {
          updateData.preferredModes = preferredModes
        }

        await volunteer.update(updateData)
      }
    }

    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ],
      attributes: { exclude: ['password'] }
    })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        volunteer: updatedUser.volunteer,
        organization: updatedUser.organization,
        organizationId: updatedUser.organization?.id
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile',
      error: error.message 
    })
  }
}

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      })
    }

    const user = await User.findOne({
      where: { verificationToken: token }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token. The token may have already been used or has expired.'
      })
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Email already verified! You can login now.'
      })
    }

    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new verification email.',
        expired: true
      })
    }

    user.isVerified = true
    user.verificationToken = null
    user.verificationExpires = null
    await user.save()

    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError)
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    })
  } catch (error) {
    console.error('❌ Verify email error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify email. Please try again or contact support.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      })
    }

    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    user.verificationToken = verificationToken
    user.verificationExpires = verificationExpires
    await user.save()

    await sendVerificationEmail(user.email, user.name, verificationToken)

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    })
  }
}

// @desc    Complete profile after Google OAuth
// @route   POST /api/auth/complete-profile
// @access  Private
export const completeProfile = async (req, res) => {
  try {
    const { phone, education } = req.body

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number is required' 
      })
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^(\+?95|0?9)\d{7,10}$/
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Myanmar phone number'
      })
    }

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    user.phone = cleanPhone
    await user.save()

    let volunteer = await Volunteer.findOne({ where: { userId: user.id } })
    
    if (!volunteer) {
      volunteer = await Volunteer.create({
        userId: user.id,
        education: education || 'undergraduate',
        skills: '',
        preferredCategories: [],
        preferredModes: [],
        notificationsEnabled: true
      })
    } else {
      await volunteer.update({
        education: education || volunteer.education
      })
    }

    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ],
      attributes: { exclude: ['password'] }
    })

    res.json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        volunteer: updatedUser.volunteer,
        organization: updatedUser.organization,
        organizationId: updatedUser.organization?.id
      }
    })
  } catch (error) {
    console.error('Complete profile error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to complete profile', 
      error: error.message 
    })
  }
}
