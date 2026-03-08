import { User } from '../src/models/index.js'
import sequelize from '../src/config/database.js'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

const resetAdminPassword = async () => {
  try {
    console.log('🔐 Admin Password Reset Tool')
    console.log('================================')
    
    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Database connected')

    const email = await question('Admin Email: ')
    const newPassword = await question('New Password: ')

    if (!email || !newPassword) {
      console.log('❌ Email and password are required')
      rl.close()
      process.exit(1)
    }

    // Find admin
    const admin = await User.findOne({ 
      where: { email, role: 'admin' } 
    })

    if (!admin) {
      console.log('❌ Admin user not found with email:', email)
      console.log('Make sure the user exists and has role: admin')
      rl.close()
      process.exit(1)
    }

    console.log('✅ Admin found:', admin.name)

    // Hash new password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    console.log('✅ Password hashed')

    // Update admin password
    await admin.update({ password: hashedPassword })

    console.log('\n✅ Admin password reset successfully!')
    console.log('================================')
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('🔑 Role:', admin.role)
    console.log('================================')
    console.log('\nYou can now login with the new password.')

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting password:', error.message)
    console.error(error)
    rl.close()
    process.exit(1)
  }
}

resetAdminPassword()
