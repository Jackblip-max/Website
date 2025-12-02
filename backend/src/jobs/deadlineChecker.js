import { Opportunity, Organization, User, Volunteer, SavedOpportunity } from '../models/index.js'
import { Op } from 'sequelize'
import { sendDeadlineReminderEmail } from '../services/emailService.js'

// Check for opportunities with deadlines tomorrow and send reminders
export const sendDeadlineReminders = async () => {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    console.log('🔔 Checking for deadline reminders...')
    console.log('Looking for deadlines on:', tomorrow.toDateString())

    // Find opportunities with deadline tomorrow
    const opportunities = await Opportunity.findAll({
      where: {
        deadline: {
          [Op.gte]: tomorrow,
          [Op.lt]: dayAfterTomorrow
        },
        status: 'active'
      },
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['name', 'id']
      }]
    })

    console.log(`Found ${opportunities.length} opportunities with deadline tomorrow`)

    for (const opportunity of opportunities) {
      // Find all volunteers who saved this opportunity but haven't applied
      const savedBy = await SavedOpportunity.findAll({
        where: { opportunityId: opportunity.id },
        include: [{
          model: Volunteer,
          as: 'volunteer',
          include: [{
            model: User,
            as: 'user',
            where: {
              isVerified: true // Only send to verified users
            },
            attributes: ['id', 'name', 'email']
          }]
        }]
      })

      console.log(`Sending reminders to ${savedBy.length} volunteers for: ${opportunity.title}`)

      // Send reminder to each volunteer
      for (const saved of savedBy) {
        const volunteer = saved.volunteer
        const user = volunteer.user

        // Check if volunteer has notifications enabled
        if (!volunteer.notificationsEnabled) {
          console.log(`Skipping ${user.email} - notifications disabled`)
          continue
        }

        try {
          await sendDeadlineReminderEmail(user.email, user.name, {
            id: opportunity.id,
            title: opportunity.title,
            organizationName: opportunity.organization.name,
            location: opportunity.location,
            mode: opportunity.mode,
            deadline: opportunity.deadline
          })

          console.log(`✅ Reminder sent to ${user.email}`)
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${user.email}:`, error.message)
        }

        // Add small delay to avoid overwhelming email server
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log('🔔 Deadline reminder check completed')
  } catch (error) {
    console.error('Error sending deadline reminders:', error)
  }
}

// Check for expired opportunities and mark them as expired
export const checkExpiredDeadlines = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log('🕐 Checking for expired deadlines...')

    // Find opportunities that expired
    const expiredOpportunities = await Opportunity.findAll({
      where: {
        deadline: {
          [Op.lt]: today
        },
        status: 'active'
      },
      include: [{
        model: Organization,
        as: 'organization',
        include: [{
          model: User,
          as: 'user'
        }]
      }]
    })

    console.log(`Found ${expiredOpportunities.length} expired opportunities`)

    for (const opportunity of expiredOpportunities) {
      // Update status to expired
      await opportunity.update({ status: 'expired' })
      console.log(`✅ Marked as expired: ${opportunity.title}`)
    }

    console.log('🕐 Expired deadline check completed')
  } catch (error) {
    console.error('Error checking expired deadlines:', error)
  }
}
