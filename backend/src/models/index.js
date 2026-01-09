import AdminLog from './AdminLog.js'

// ... existing code ...

// Add AdminLog relationships
User.hasMany(AdminLog, { foreignKey: 'adminId', as: 'adminLogs' })
AdminLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' })

// Update exports
export {
  User,
  Volunteer,
  Organization,
  Opportunity,
  Application,
  SavedOpportunity,
  Notification,
  AdminLog  // Add this
}
