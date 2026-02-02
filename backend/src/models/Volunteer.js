import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  preferredCategories: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  preferredModes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  viewedOpportunities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  clickedOpportunities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'volunteers',
  timestamps: true
});

// Define associations
Volunteer.associate = (models) => {
  // Volunteer belongs to User
  Volunteer.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  // Volunteer has many Applications
  Volunteer.hasMany(models.Application, {
    foreignKey: 'volunteerId',
    as: 'applications'
  });
  
  // Volunteer has many SavedOpportunities
  Volunteer.hasMany(models.SavedOpportunity, {
    foreignKey: 'volunteerId',
    as: 'savedOpportunities'
  });
};

export default Volunteer;
