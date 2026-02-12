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
    field: 'volunteerId',  // ✅ ADDED: Explicitly specify column name
    references: {
      model: 'volunteers',
      key: 'id'
    }
  },
  opportunityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'opportunityId',  // ✅ ADDED: Explicitly specify column name
    references: {
      model: 'opportunities',
      key: 'id'
    }
  }
}, {
  tableName: 'saved_opportunities',
  timestamps: true,
  underscored: false  // ✅ CRITICAL FIX: Tells Sequelize to use camelCase, not snake_case
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
