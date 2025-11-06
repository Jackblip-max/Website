import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const SavedOpportunity = sequelize.define('SavedOpportunity', {
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
  }
}, {
  tableName: 'saved_opportunities',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['opportunityId', 'volunteerId']
    }
  ]
})

export default SavedOpportunity