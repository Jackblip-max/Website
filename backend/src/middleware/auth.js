import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireOrganization = async (req, res, next) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({ message: 'Organization access required' })
    }
    next()
  } catch (error) {
    console.error('Authorization error:', error)
    return res.status(403).json({ message: 'Authorization failed' })
  }
}

export const requireVolunteer = async (req, res, next) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Volunteer access required' })
    }
    next()
  } catch (error) {
    console.error('Authorization error:', error)
    return res.status(403).json({ message: 'Authorization failed' })
  }
}