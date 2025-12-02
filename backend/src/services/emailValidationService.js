import dns from 'dns'
import { promisify } from 'util'

const resolveMx = promisify(dns.resolveMx)

/**
 * Validates if an email domain has valid MX records
 */
export const validateEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1]
    const addresses = await resolveMx(domain)
    return addresses && addresses.length > 0
  } catch (error) {
    console.error('Domain validation error:', error)
    return false
  }
}

/**
 * Check if email is a Gmail address
 */
export const isGmailAddress = (email) => {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain === 'gmail.com' || domain === 'googlemail.com'
}

/**
 * Validate Gmail account existence
 * Note: This is a basic check. Google doesn't provide a public API to verify account existence.
 * We'll validate:
 * 1. Email format
 * 2. Domain validity
 * 3. Common Gmail patterns
 */
export const validateGmailAccount = async (email) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: 'Invalid email format'
      }
    }

    // Check if it's a Gmail address
    if (!isGmailAddress(email)) {
      // For non-Gmail addresses, just validate the domain
      const domainValid = await validateEmailDomain(email)
      return {
        valid: domainValid,
        message: domainValid ? 'Email domain is valid' : 'Email domain does not exist'
      }
    }

    // For Gmail addresses, validate the format
    const gmailRegex = /^[a-zA-Z0-9._-]+@(gmail|googlemail)\.com$/
    if (!gmailRegex.test(email)) {
      return {
        valid: false,
        message: 'Invalid Gmail address format'
      }
    }

    // Check if Gmail username meets requirements
    const username = email.split('@')[0]
    
    // Gmail usernames must be 6-30 characters
    if (username.length < 6 || username.length > 30) {
      return {
        valid: false,
        message: 'Gmail usernames must be between 6 and 30 characters'
      }
    }

    // Check for invalid characters or patterns
    if (username.startsWith('.') || username.endsWith('.')) {
      return {
        valid: false,
        message: 'Gmail addresses cannot start or end with a period'
      }
    }

    if (username.includes('..')) {
      return {
        valid: false,
        message: 'Gmail addresses cannot have consecutive periods'
      }
    }

    // Validate domain
    const domainValid = await validateEmailDomain(email)
    
    return {
      valid: domainValid,
      message: domainValid 
        ? 'Email appears to be valid' 
        : 'Unable to verify email. Please ensure your Gmail account exists.'
    }
  } catch (error) {
    console.error('Gmail validation error:', error)
    return {
      valid: false,
      message: 'Unable to validate email address'
    }
  }
}

/**
 * Simple email existence check by attempting to validate domain
 */
export const quickEmailCheck = async (email) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return false
    }

    // Validate domain has MX records
    return await validateEmailDomain(email)
  } catch (error) {
    console.error('Quick email check error:', error)
    return false
  }
}
