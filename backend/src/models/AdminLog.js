import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // ✅ VARCHAR(50) to match actual DB column — not ENUM
  targetType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: true  // ✅ allowNull true — some actions may not have a target
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'admin_logs',
  timestamps: true,
  updatedAt: false
})

export { AdminLog }
export default AdminLog
