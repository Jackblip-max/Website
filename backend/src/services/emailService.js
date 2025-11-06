import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"MyanVolunteer" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to MyanVolunteer!'
  const text = `
    Dear ${userName},
    
    Welcome to MyanVolunteer! We're excited to have you join our community.
    
    Start exploring volunteer opportunities and make a difference in Myanmar.
    
    Best regards,
    MyanVolunteer Team
  `
  
  return await sendEmail({ to: userEmail, subject, text })
}

export const sendApplicationNotification = async (orgEmail, volunteerName, opportunityTitle) => {
  const subject = 'New Volunteer Application'
  const text = `
    Hello,
    
    ${volunteerName} has applied for your opportunity: "${opportunityTitle}"
    
    Please review the application in your organization dashboard.
    
    Best regards,
    MyanVolunteer Team
  `
  
  return await sendEmail({ to: orgEmail, subject, text })
}

export const sendApplicationAcceptance = async (volunteerEmail, opportunityTitle) => {
  const subject = 'Application Accepted!'
  const text = `
    Congratulations!
    
    Your application for "${opportunityTitle}" has been accepted.
    
    The organization will contact you soon with further details.
    
    Best regards,
    MyanVolunteer Team
  `
  
  return await sendEmail({ to: volunteerEmail, subject, text })
}