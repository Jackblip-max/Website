import { Opportunity, Organization, User } from '../models/index.js'
import { Op } from 'sequelize'

export const checkExpiredDeadlines = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find opportunities that expired today
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

    for (const opportunity of expiredOpportunities) {
      // Update status to expired
      await opportunity.update({ status: 'expired' })

      // Send notification email to organization
      if (opportunity.organization.user.email) {
        await sendEmail({
          to: opportunity.organization.user.email,
          subject: 'Opportunity Deadline Expired',
          text: `The deadline for "${opportunity.title}" has expired. The opportunity has been automatically closed.`
        })
      }

      console.log(`Opportunity "${opportunity.title}" marked as expired`)
    }

    console.log(`Checked and updated ${expiredOpportunities.length} expired opportunities`)
  } catch (error) {
    console.error('Error checking expired deadlines:', error)
  }
}