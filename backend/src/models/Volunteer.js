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
