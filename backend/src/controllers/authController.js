import jwt from 'jsonwebtoken'
import { User, Volunteer, Organization } from '../models/index.js'

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, education, skills, teamwork, motivation } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'volunteer'
    })

    // Create volunteer profile
    await Volunteer.create({
      userId: user.id,
      education,
      skills,
      teamwork,
      motivation
    })

    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ]
    })

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

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
        organizationId: user.organization?.id || null
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

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
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        volunteer: user.volunteer,
        organization: user.organization
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to get profile', error: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, education, skills, teamwork, motivation } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update user
    if (name) user.name = name
    if (phone) user.phone = phone
    await user.save()

    // Update volunteer profile if exists
    if (user.role === 'volunteer') {
      const volunteer = await Volunteer.findOne({ where: { userId: user.id } })
      if (volunteer) {
        if (education) volunteer.education = education
        if (skills !== undefined) volunteer.skills = skills
        if (teamwork !== undefined) volunteer.teamwork = teamwork
        if (motivation !== undefined) volunteer.motivation = motivation
        await volunteer.save()
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Failed to update profile', error: error.message })
  }
}

export const completeProfile = async (req, res) => {
  try {
    const { phone, education, skills, teamwork, motivation } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update user phone
    if (phone) user.phone = phone
    await user.save()

    // Update or create volunteer profile
    let volunteer = await Volunteer.findOne({ where: { userId: user.id } })
    
    if (!volunteer) {
      volunteer = await Volunteer.create({
        userId: user.id,
        education: education || 'undergraduate',
        skills: skills || '',
        teamwork: teamwork || false,
        motivation: motivation || ''
      })
    } else {
      await volunteer.update({
        education: education || volunteer.education,
        skills: skills !== undefined ? skills : volunteer.skills,
        teamwork: teamwork !== undefined ? teamwork : volunteer.teamwork,
        motivation: motivation !== undefined ? motivation : volunteer.motivation
      })
    }

    res.json({
      success: true,
      message: 'Profile completed successfully'
    })
  } catch (error) {
    console.error('Complete profile error:', error)
    res.status(500).json({ message: 'Failed to complete profile', error: error.message })
  }
}
