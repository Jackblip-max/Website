import { DataTypes } from 'sequelize'
import bcrypt from 'bcryptjs'
import sequelize from '../config/database.js'

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'users_name_unique',
      msg: 'This username is already taken'
    },
    validate: {
      len: {
        args: [2, 50],
        msg: 'Name must be between 2 and 50 characters'
      },
      isAlphanumericWithSpaces(value) {
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          throw new Error('Name can only contain letters and spaces')
        }
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'users_email_unique',
      msg: 'This email is already registered'
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: {
      name: 'users_phone_unique',
      msg: 'This phone number is already registered'
    },
    validate: {
      isValidPhone(value) {
        if (value && !/^(\+?95|0?9)\d{7,10}$/.test(value.replace(/\s/g, ''))) {
          throw new Error('Please provide a valid Myanmar phone number')
        }
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: {
      name: 'users_google_id_unique',
      msg: 'This Google account is already linked'
    }
  },
  role: {
    type: DataTypes.ENUM('volunteer', 'organization'),
    defaultValue: 'volunteer'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'users_email_unique'
    },
    {
      unique: true,
      fields: ['name'],
      name: 'users_name_unique'
    },
    {
      unique: true,
      fields: ['phone'],
      name: 'users_phone_unique',
      where: {
        phone: { [sequelize.Sequelize.Op.ne]: null }
      }
    },
    {
      unique: true,
      fields: ['googleId'],
      name: 'users_google_id_unique',
      where: {
        googleId: { [sequelize.Sequelize.Op.ne]: null }
      }
    }
  ],
  hooks: {}
})

// Keep the comparePassword method for login
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false
  return await bcrypt.compare(candidatePassword, this.password)
}

export { User }
export default User
