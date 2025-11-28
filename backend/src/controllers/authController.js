import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, Volunteer, Organization } from '../models/index.js'

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '***' })
    
    const { name, email, phone, password, education, skills, teamwork, motivation } = req.body

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, phone, and password' 
      })
    }

    // Validate phone format (Myanmar format)
    const phoneRegex = /^(\+?95|09)\d{7,10}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid Myanmar phone number' 
      })
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } })
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'volunteer',
      isVerified: false
    })

    console.log('User created successfully:', user.id)

    // Create volunteer profile
    await Volunteer.create({
      userId: user.id,
      education: education || 'undergraduate',
      skills: skills || '',
      teamwork: teamwork || false,
      motivation: motivation || '',
      notificationsEnabled: true
    })

    console.log('Volunteer profile created successfully')

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message 
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      })
    }

    // Check if user exists
    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ]
    })

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return res.status(401).json({ 
        success: false,
        message: 'This account uses Google sign-in. Please login with Google.' 
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    // Generate token
    const token = generateToken(user.id)

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        volunteer: user.volunteer,
        organization: user.organization,
        organizationId: user.organization?.id
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message 
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
    const { name, phone, education, skills, teamwork, motivation, notificationsEnabled } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    // Update user basic info
    if (name) user.name = name
    if (phone) user.phone = phone
    await user.save()

    // Update volunteer profile if exists
    if (user.role === 'volunteer') {
      const volunteer = await Volunteer.findOne({ where: { userId: user.id } })
      if (volunteer) {
        await volunteer.update({
          education: education || volunteer.education,
          skills: skills !== undefined ? skills : volunteer.skills,
          teamwork: teamwork !== undefined ? teamwork : volunteer.teamwork,
          motivation: motivation !== undefined ? motivation : volunteer.motivation,
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

// @desc    Complete profile after Google OAuth
// @route   POST /api/auth/complete-profile
// @access  Private
export const completeProfile = async (req, res) => {
  try {
    console.log('Complete profile request:', req.body)
    console.log('User from token:', req.user)

    const { name, phone, education, skills, teamwork, motivation } = req.body

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and phone are required fields' 
      })
    }

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    // Update user basic info
    user.name = name
    user.phone = phone
    await user.save()

    console.log('User updated:', user.id)

    // Update or create volunteer profile
    let volunteer = await Volunteer.findOne({ where: { userId: user.id } })
    
    if (!volunteer) {
      console.log('Creating new volunteer profile')
      volunteer = await Volunteer.create({
        userId: user.id,
        education: education || 'undergraduate',
        skills: skills || '',
        teamwork: teamwork !== undefined ? teamwork : false,
        motivation: motivation || '',
        notificationsEnabled: true
      })
    } else {
      console.log('Updating existing volunteer profile')
      await volunteer.update({
        education: education || volunteer.education,
        skills: skills !== undefined ? skills : volunteer.skills,
        teamwork: teamwork !== undefined ? teamwork : volunteer.teamwork,
        motivation: motivation !== undefined ? motivation : volunteer.motivation
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
