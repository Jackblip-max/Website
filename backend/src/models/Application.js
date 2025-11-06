import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  opportunityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'opportunities',
      key: 'id'
    }
  },
  volunteerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'volunteers',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'applications',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['opportunityId', 'volunteerId']
    }
  ]
})

export default Application