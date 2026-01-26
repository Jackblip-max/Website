import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'applications',
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
  },
  volunteerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'volunteers',
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  certificateUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Path to generated certificate JPG'
  },
  certificateNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique certificate identifier e.g. CERT-2026-0001'
  },
  verificationCode: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique code for certificate verification'
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date when volunteer completed the opportunity'
  },
  hoursContributed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total hours volunteer contributed'
  },
  customMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional message from organization'
  },
  issuedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User ID who issued the certificate'
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['certificateNumber']
    },
    {
      unique: true,
      fields: ['verificationCode']
    },
    {
      unique: true,
      fields: ['applicationId']
    }
  ]
})

export { Certificate }
export default Certificate
