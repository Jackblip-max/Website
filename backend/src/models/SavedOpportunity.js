import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SavedOpportunity = sequelize.define('SavedOpportunity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  volunteerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'volunteers',
      key: 'id'
    }
  },
  opportunityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'opportunities',
      key: 'id'
    }
  }
  // 🔥 REMOVED: savedAt field (doesn't exist in your database)
  // Sequelize automatically adds createdAt and updatedAt
}, {
  tableName: 'saved_opportunities',
  timestamps: true  // This adds createdAt and updatedAt automatically
});

// This function will be called by models/index.js
SavedOpportunity.associate = (models) => {
  // SavedOpportunity belongs to Volunteer
  SavedOpportunity.belongsTo(models.Volunteer, {
    foreignKey: 'volunteerId',
    as: 'volunteer'
  });
  
  // SavedOpportunity belongs to Opportunity
  SavedOpportunity.belongsTo(models.Opportunity, {
    foreignKey: 'opportunityId',
    as: 'opportunity'
  });
};

export default SavedOpportunity;
