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

export const sendOrganizationApprovalEmail = async (userEmail, userName, organizationName) => {
  const subject = '✅ Organization Approved - MyanVolunteer'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .feature-item:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1>Congratulations! Your Organization is Approved!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Great news! Your organization <strong>${organizationName}</strong> has been verified and approved by our admin team.</p>
          
          <div class="features">
            <h3>✨ What You Can Do Now:</h3>
            <div class="feature-item">
              ✅ <strong>Post Volunteer Opportunities</strong> - Share your volunteer needs with the community
            </div>
            <div class="feature-item">
              ✅ <strong>Manage Applications</strong> - Review and accept volunteer applications
            </div>
            <div class="feature-item">
              ✅ <strong>Build Your Team</strong> - Connect with passionate volunteers
            </div>
            <div class="feature-item">
              ✅ <strong>Track Your Impact</strong> - Monitor your organization's volunteer engagement
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/org-dashboard" class="button">Go to Dashboard</a>
          </div>
          
          <p style="margin-top: 20px;">Your organization profile is now visible to volunteers across Myanmar. Start posting opportunities and make a difference!</p>
          
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          
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
    Congratulations ${userName}!
    
    Your organization "${organizationName}" has been verified and approved.
    
    You can now:
    - Post volunteer opportunities
    - Manage applications
    - Build your volunteer team
    - Track your impact
    
    Visit your dashboard: ${process.env.FRONTEND_URL}/org-dashboard
    
    Best regards,
    The MyanVolunteer Team
  `
  
  return await sendEmail({ to: userEmail, subject, text, html })
}

export const sendOrganizationRejectionEmail = async (userEmail, userName, organizationName, reason) => {
  const subject = 'Organization Verification Update - MyanVolunteer'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff7ed; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason-box { background: white; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { padding: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Organization Verification Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Thank you for submitting your organization <strong>${organizationName}</strong> for verification on MyanVolunteer.</p>
          
          <p>After careful review, our team has found that additional information or clarification is needed before we can approve your organization.</p>
          
          <div class="reason-box">
            <h3>📋 Feedback from our team:</h3>
            <p>${reason}</p>
          </div>
          
          <div class="steps">
            <h3>🔄 Next Steps:</h3>
            <div class="step">
              <strong>1.</strong> Review the feedback above carefully
            </div>
            <div class="step">
              <strong>2.</strong> Update your organization information
            </div>
            <div class="step">
              <strong>3.</strong> Contact us if you have questions: ${process.env.SMTP_USER}
            </div>
            <div class="step">
              <strong>4.</strong> Resubmit when ready (you may need to create a new organization profile)
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/contact" class="button">Contact Support</a>
          </div>
          
          <p style="margin-top: 20px;">We're here to help! If you have any questions about this decision or need clarification, please don't hesitate to reach out to our support team.</p>
          
          <p>Best regards,<br>The MyanVolunteer Admin Team</p>
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
    Hello ${userName},
    
    Thank you for submitting "${organizationName}" for verification.
    
    After review, we need additional information before approval.
    
    Feedback: ${reason}
    
    Next Steps:
    1. Review the feedback
    2. Update your organization information
    3. Contact us if needed: ${process.env.SMTP_USER}
    4. Resubmit when ready
    
    We're here to help!
    
    Best regards,
    The MyanVolunteer Admin Team
  `
  
  return await sendEmail({ to: userEmail, subject, text, html })
}

export const sendCertificateEmail = async (userEmail, userName, certificateData) => {
  const { opportunityTitle, organizationName, certificateNumber, verificationCode, certificateUrl, certificateFilePath } = certificateData
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${verificationCode}`
  
  const subject = `🎓 Your Volunteer Certificate - ${opportunityTitle}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .certificate-box { background: white; border: 3px solid #10b981; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
        .cert-number { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #1e40af; margin: 10px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 10px 0; font-weight: bold; }
        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .achievement-icon { font-size: 64px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="achievement-icon">🎓</div>
          <h1>Congratulations ${userName}!</h1>
          <p style="font-size: 18px; margin-top: 10px;">Your Certificate is Ready!</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Certificate of Achievement</h2>
          
          <p style="font-size: 16px; color: #374151;">
            We are thrilled to inform you that your volunteer certificate has been issued by <strong>${organizationName}</strong> 
            for successfully completing:
          </p>
          
          <div class="certificate-box">
            <h3 style="color: #10b981; margin-bottom: 10px;">${opportunityTitle}</h3>
            <div class="cert-number">Certificate No: ${certificateNumber}</div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              This certificate recognizes your dedication and contribution to making a positive impact in the community.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${certificateUrl}" class="button" style="color: white;">
              📥 Download Certificate
            </a>
          </div>
          
          <div class="info-box">
            <p style="margin: 0; color: #1e40af;">
              <strong>📋 Certificate Details:</strong>
            </p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #1f3a8a;">
              <li>Certificate Number: <strong>${certificateNumber}</strong></li>
              <li>Organization: ${organizationName}</li>
              <li>Opportunity: ${opportunityTitle}</li>
              <li>Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; color: #92400e;">
              <strong>🔐 Verify Your Certificate:</strong><br>
              Your certificate includes a unique QR code and verification code for authenticity. 
              Anyone can verify it at:
            </p>
            <p style="margin: 10px 0;">
              <a href="${verificationUrl}" style="color: #1e40af; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px;">What's Next?</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>📂 <strong>Save your certificate</strong> in a safe place</li>
            <li>💼 <strong>Add it to your resume</strong> or LinkedIn profile</li>
            <li>📱 <strong>Share it on social media</strong> to inspire others</li>
            <li>🔍 <strong>Use the QR code</strong> to verify authenticity anytime</li>
            <li>🌟 <strong>Continue volunteering</strong> to earn more certificates!</li>
          </ul>
          
          <p style="margin-top: 30px; color: #374151;">
            Thank you for your valuable contribution to <strong>${organizationName}</strong> 
            and for making a difference in our community. We hope to see you volunteering again soon!
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 10px;">
            <p style="font-size: 18px; font-weight: bold; color: #065f46; margin: 0;">
              🌟 Keep Making a Difference! 🌟
            </p>
            <p style="color: #047857; margin-top: 10px;">
              Browse more volunteer opportunities at MyanVolunteer
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            If you have any questions about your certificate, please contact ${organizationName} directly 
            or reach out to our support team.
          </p>
          
          <p style="margin-top: 20px;">
            Best regards,<br>
            <strong>The MyanVolunteer Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 MyanVolunteer. All rights reserved.</p>
          <p>This certificate was issued by ${organizationName}</p>
          <p style="margin-top: 10px;">
            <a href="${verificationUrl}" style="color: #6b7280;">Verify Certificate</a> • 
            <a href="${process.env.FRONTEND_URL}" style="color: #6b7280;">Visit MyanVolunteer</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Congratulations ${userName}!
    
    Your Certificate is Ready!
    
    You have been awarded a certificate by ${organizationName} for successfully completing:
    ${opportunityTitle}
    
    Certificate Number: ${certificateNumber}
    
    Download your certificate: ${certificateUrl}
    
    Verify your certificate: ${verificationUrl}
    
    What's Next?
    - Save your certificate in a safe place
    - Add it to your resume or LinkedIn profile
    - Share it on social media
    - Continue volunteering to earn more certificates!
    
    Thank you for your valuable contribution and for making a difference!
    
    Best regards,
    The MyanVolunteer Team
  `
  
  try {
    // Prepare email with attachment
    const mailOptions = {
      from: `"MyanVolunteer" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      text,
      html,
      attachments: [
        {
          filename: `Certificate_${certificateNumber}.jpg`,
          path: certificateFilePath
        }
      ]
    }

    console.log('📧 Sending certificate email to:', userEmail)
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Certificate email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Certificate email error:', error)
    throw new Error(`Failed to send certificate email: ${error.message}`)
  }
}
