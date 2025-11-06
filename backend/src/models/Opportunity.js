import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Opportunity = sequelize.define('Opportunity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('environment', 'education', 'healthcare', 'community', 'animals', 'arts'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mode: {
    type: DataTypes.ENUM('onsite', 'remote', 'hybrid'),
    allowNull: false
  },
  timeCommitment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'closed'),
    defaultValue: 'active'
  }
}, {
  tableName: 'opportunities',
  timestamps: true
})

export default Opportunity