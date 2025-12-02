import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Op } from 'sequelize'
import { User, Volunteer, Organization } from '../models/index.js'
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js'

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    // Check if email exists
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

    // Validate name format
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

    // Check if name exists (case-insensitive)
    const existingUser = await User.findOne({ 
      where: { 
        name: {
          [Op.iLike]: trimmedName
        }
      } 
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

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '***' })
    
    const { name, email, phone, password, education } = req.body

    // Validate required fields
    if (!name || !email || !phone || !password) {
      console.log('Missing required fields')
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, phone, and password' 
      })
    }

    // Validate name
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

    // Check if name already exists (case-insensitive)
    const nameExists = await User.findOne({ 
      where: { 
        name: {
          [Op.iLike]: trimmedName
        }
      } 
    })
    
    if (nameExists) {
      console.log('Name already exists:', trimmedName)
      return res.status(400).json({ 
        success: false,
        message: 'This name is already taken. Please choose a different name.' 
      })
    }

    // Validate phone format (Myanmar format)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^(\+?95|0?9)\d{7,10}$/
    if (!phoneRegex.test(cleanPhone)) {
      console.log('Invalid phone format:', phone)
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid Myanmar phone number (e.g., 09xxxxxxxxx or +959xxxxxxxxx)' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email)
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Check if user exists with this email
    const userExists = await User.findOne({ where: { email: email.trim().toLowerCase() } })
    if (userExists) {
      console.log('User already exists:', email)
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      })
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({ where: { phone: cleanPhone } })
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    console.log('Password hashed successfully')

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with hashed password
    const user = await User.create({
      name: trimmedName,
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password: hashedPassword,
      role: 'volunteer',
      isVerified: false,
      verificationToken,
      verificationExpires
    })

    console.log('User created successfully:', user.id)

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken)
      console.log('Verification email sent to:', user.email)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue with registration even if email fails
    }

    // Create volunteer profile
    await Volunteer.create({
      userId: user.id,
      education: education || 'undergraduate',
      skills: '',
      notificationsEnabled: true
    })

    console.log('Volunteer profile created successfully')

    // Generate token
    const token = generateToken(user.id)

    // Return response without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      volunteer: {
        education: education || 'undergraduate',
        skills: '',
        notificationsEnabled: true
      }
    }

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'Registration successful! Please check your email to verify your account.'
    })
  } catch (error) {
    console.error('Register error details:', error)
    console.error('Error stack:', error.stack)
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

    // Validate input
    if (!email || !password) {
      console.log('🔐 Missing credentials')
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      })
    }

    // Check if user exists
    console.log('🔐 Searching for user:', email.trim().toLowerCase())
    const user = await User.findOne({ 
      where: { email: email.trim().toLowerCase() },
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ]
    })

    if (!user) {
      console.log('🔐 User not found')
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    console.log('🔐 User found:', user.id)
    console.log('🔐 User has password:', !!user.password)

    // Check if user has a password
    if (!user.password) {
      console.log('🔐 User has no password')
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    // Check password using bcrypt.compare directly
    console.log('🔐 Comparing passwords...')
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('🔐 Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('🔐 Invalid password')
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    console.log('🔐 Password validated successfully')

    // Generate token
    const token = generateToken(user.id)
    console.log('🔐 Token generated')

    // Prepare user response (exclude password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      volunteer: user.volunteer,
      organization: user.organization,
      organizationId: user.organization?.id
    }

    console.log('🔐 Login successful for user:', user.id)

    res.json({
      success: true,
      token,
      user: userResponse
    })
  } catch (error) {
    console.error('🔐 Login error:', error)
    console.error('🔐 Error stack:', error.stack)
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
      volunteer: user.volunteer,
      organization: user.organization,
      organizationId: user.organization?.id
    })
  } catch (error) {
    console.error('Get profile error:', error)
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
    const { name, phone, education, skills, notificationsEnabled } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    // Update user basic info
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

    // Update volunteer profile if exists
    if (user.role === 'volunteer') {
      const volunteer = await Volunteer.findOne({ where: { userId: user.id } })
      if (volunteer) {
        await volunteer.update({
          education: education || volunteer.education,
          skills: skills !== undefined ? skills : volunteer.skills,
          notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : volunteer.notificationsEnabled
        })
      }
    }

    // Return updated user
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
        volunteer: updatedUser.volunteer,
        organization: updatedUser.organization
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

    // Find user with this token
    const user = await User.findOne({
      where: {
        verificationToken: token
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      })
    }

    // Check if token has expired
    if (new Date() > user.verificationExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      })
    }

    // Verify the user
    user.isVerified = true
    user.verificationToken = null
    user.verificationExpires = null
    await user.save()

    console.log('User verified successfully:', user.email)

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    })
  } catch (error) {
    console.error('Verify email error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
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

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    user.verificationToken = verificationToken
    user.verificationExpires = verificationExpires
    await user.save()

    // Send verification email
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
    console.log('Complete profile request:', req.body)
    console.log('User from token:', req.user)

    const { phone, education } = req.body

    // Validate required fields - only phone is required now
    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number is required' 
      })
    }

    // Validate phone
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

    // Update user phone
    user.phone = cleanPhone
    await user.save()

    console.log('User updated:', user.id)

    // Update or create volunteer profile
    let volunteer = await Volunteer.findOne({ where: { userId: user.id } })
    
    if (!volunteer) {
      console.log('Creating new volunteer profile')
      volunteer = await Volunteer.create({
        userId: user.id,
        education: education || 'undergraduate',
        skills: '',
        notificationsEnabled: true
      })
    } else {
      console.log('Updating existing volunteer profile')
      await volunteer.update({
        education: education || volunteer.education
      })
    }

    // Return updated user with volunteer profile
    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ],
      attributes: { exclude: ['password'] }
    })

    console.log('Profile completed successfully for user:', updatedUser.id)

    res.json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
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
