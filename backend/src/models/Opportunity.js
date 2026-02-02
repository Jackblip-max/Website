import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
    type: DataTypes.STRING,
    allowNull: false
  },
  mode: {
    type: DataTypes.ENUM('onsite', 'online', 'hybrid'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  requiredSkills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'closed', 'cancelled'),
    defaultValue: 'active'
  },
  maxVolunteers: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'opportunities',
  timestamps: true
});

// Define associations
Opportunity.associate = (models) => {
  // Opportunity belongs to Organization
  Opportunity.belongsTo(models.Organization, {
    foreignKey: 'organizationId',
    as: 'organization'
  });
  
  // Opportunity has many Applications
  Opportunity.hasMany(models.Application, {
    foreignKey: 'opportunityId',
    as: 'applications'
  });
  
  // Opportunity has many SavedOpportunities
  Opportunity.hasMany(models.SavedOpportunity, {
    foreignKey: 'opportunityId',
    as: 'savedBy'
  });
};

export default Opportunity;
