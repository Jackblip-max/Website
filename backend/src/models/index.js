import User from './User.js'
import Volunteer from './Volunteer.js'
import Organization from './Organization.js'
import Opportunity from './Opportunity.js'
import Application from './Application.js'
import SavedOpportunity from './SavedOpportunity.js'
import Notification from './Notification.js'
import AdminLog from './AdminLog.js'

// User - Volunteer (One-to-One)
User.hasOne(Volunteer, { foreignKey: 'userId', as: 'volunteer' })
Volunteer.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// User - Organization (One-to-One)
User.hasOne(Organization, { foreignKey: 'userId', as: 'organization' })
Organization.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Organization - Opportunities (One-to-Many)
Organization.hasMany(Opportunity, { foreignKey: 'organizationId', as: 'opportunities' })
Opportunity.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' })

// Volunteer - Applications (One-to-Many)
Volunteer.hasMany(Application, { foreignKey: 'volunteerId', as: 'applications' })
Application.belongsTo(Volunteer, { foreignKey: 'volunteerId', as: 'volunteer' })

// Opportunity - Applications (One-to-Many)
Opportunity.hasMany(Application, { foreignKey: 'opportunityId', as: 'applications' })
Application.belongsTo(Opportunity, { foreignKey: 'opportunityId', as: 'opportunity' })

// Volunteer - SavedOpportunities (Many-to-Many)
Volunteer.belongsToMany(Opportunity, { through: SavedOpportunity, foreignKey: 'volunteerId', as: 'savedOpportunities' })
Opportunity.belongsToMany(Volunteer, { through: SavedOpportunity, foreignKey: 'opportunityId', as: 'savedByVolunteers' })

// User - Notifications (One-to-Many)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' })
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Add AdminLog relationships
User.hasMany(AdminLog, { foreignKey: 'adminId', as: 'adminLogs' })
AdminLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' })

export {
  User,
  Volunteer,
  Organization,
  Opportunity,
  Application,
  SavedOpportunity,
  Notification,
  AdminLog
}
