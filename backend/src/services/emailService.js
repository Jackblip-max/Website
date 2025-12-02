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
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
})

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error)
    console.error('Please check your SMTP settings in .env file')
  } else {
    console.log('✅ Email service is ready')
  }
})

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email address format')
    }

    const mailOptions = {
      from: `"MyanVolunteer" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text
    }

    console.log('📧 Attempting to send email to:', to)
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
    console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(info))
    return info
  } catch (error) {
    console.error('❌ Email sending error:', error)
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    })
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check SMTP credentials.')
    } else if (error.code === 'ESOCKET') {
      throw new Error('Cannot connect to email server. Please check SMTP host and port.')
    } else if (error.responseCode === 550) {
      throw new Error('Email address does not exist or cannot receive messages.')
    } else {
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }
}

export const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
  
  const subject = 'Verify Your Email - MyanVolunteer'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .token { background: #e5e7eb; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to MyanVolunteer! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for registering with MyanVolunteer. We're excited to have you join our community of volunteers making a difference in Myanmar.</p>
          
          <p>To complete your registration and start exploring volunteer opportunities, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div class="token">${verificationUrl}</div>
          
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with MyanVolunteer, please ignore this email.</p>
          
          <p>Best regards,<br>The MyanVolunteer Team</p>
        </div>
        <div class="footer">
          <p>© 2025 MyanVolunteer. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Hello ${userName}!
    
    Welcome to MyanVolunteer! Thank you for registering.
    
    Please verify your email address by clicking the link below:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, please ignore this email.
    
    Best regards,
    The MyanVolunteer Team
  `
  
  try {
    const result = await sendEmail({ to: userEmail, subject, text, html })
    console.log('✅ Verification email sent successfully to:', userEmail)
    return result
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message)
    // Re-throw with more context
    throw new Error(`Failed to send verification email: ${error.message}`)
  }
}

export const sendDeadlineReminderEmail = async (userEmail, userName, opportunity) => {
  const opportunityUrl = `${process.env.FRONTEND_URL}/opportunities/${opportunity.id}`
  
  const subject = `Reminder: Application Deadline Tomorrow - ${opportunity.title}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff7ed; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .opportunity-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Application Deadline Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          
          <div class="alert-box">
            <strong>⚠️ Important:</strong> The application deadline for the following opportunity is tomorrow!
          </div>
          
          <div class="opportunity-details">
            <h3>${opportunity.title}</h3>
            <p><strong>Organization:</strong> ${opportunity.organizationName}</p>
            <p><strong>Location:</strong> ${opportunity.location}</p>
            <p><strong>Mode:</strong> ${opportunity.mode}</p>
            <p><strong>Deadline:</strong> ${new Date(opportunity.deadline).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <p>Don't miss this opportunity to make a difference! Apply now before the deadline passes.</p>
          
          <div style="text-align: center;">
            <a href="${opportunityUrl}" class="button">View & Apply Now</a>
          </div>
          
          <p>If you've already applied or are no longer interested, you can ignore this reminder.</p>
          
          <p>Best regards,<br>The MyanVolunteer Team</p>
        </div>
        <div class="footer">
          <p>© 2025 MyanVolunteer. All rights reserved.</p>
          <p>You can manage your notification preferences in your profile settings.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Hello ${userName}!
    
    ⏰ REMINDER: Application deadline is tomorrow!
    
    Opportunity: ${opportunity.title}
    Organization: ${opportunity.organizationName}
    Location: ${opportunity.location}
    Deadline: ${new Date(opportunity.deadline).toLocaleDateString()}
    
    Apply now: ${opportunityUrl}
    
    Don't miss this chance to make a difference!
    
    Best regards,
    The MyanVolunteer Team
  `
  
  return await sendEmail({ to: userEmail, subject, text, html })
}

export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to MyanVolunteer! 🎉'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to MyanVolunteer! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Your email has been verified successfully! Welcome to our community.</p>
          <p>Start exploring volunteer opportunities and make a difference in Myanmar.</p>
          <p>Best regards,<br>The MyanVolunteer Team</p>
        </div>
        <div class="footer">
          <p>© 2025 MyanVolunteer. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Hello ${userName}!
    
    Welcome to MyanVolunteer! Your email has been verified successfully.
    
    Start exploring volunteer opportunities and make a difference in Myanmar.
    
    Best regards,
    The MyanVolunteer Team
  `
  
  return await sendEmail({ to: userEmail, subject, text, html })
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
