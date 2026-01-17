import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  education: {
    type: DataTypes.ENUM('highSchool', 'undergraduate', 'graduate'),
    allowNull: false
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // NEW: User preferences for ML recommendations
  preferredCategories: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of preferred categories: ["environment", "education", etc.]'
  },
  preferredModes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of preferred work modes: ["onsite", "remote", "hybrid"]'
  },
  // Track user interactions for ML
  viewedOpportunities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of opportunity IDs user has viewed'
  },
  clickedOpportunities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of opportunity IDs user has clicked'
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'volunteers',
  timestamps: true
})

export { Volunteer }
export default Volunteer
