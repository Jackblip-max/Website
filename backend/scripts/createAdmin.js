import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import readline from 'readline'
import { sequelize } from '../src/config/database.js'
import { User } from '../src/models/index.js'

dotenv.config()

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Promisify readline question
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

const createAdminUser = async () => {
  try {
    console.log('\n🔐 MyanVolunteer Admin Creator')
    console.log('================================\n')
    
    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Database connected\n')

    // Get admin details from user
    console.log('Please enter admin details:\n')
    
    const name = await question('Admin Name (e.g., John Doe): ')
    if (!name || name.trim().length < 2) {
      console.log('❌ Name must be at least 2 characters')
      rl.close()
      process.exit(1)
    }

    const email = await question('Admin Email (e.g., admin@myanvolunteer.org): ')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format')
      rl.close()
      process.exit(1)
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } })
    if (existingUser) {
      console.log('\n⚠️  User with this email already exists')
      console.log('Current role:', existingUser.role)
      
      if (existingUser.role === 'admin') {
        console.log('✅ This user is already an admin')
        rl.close()
        process.exit(0)
      }
      
      const updateToAdmin = await question('\nConvert this user to admin? (yes/no): ')
      if (updateToAdmin.toLowerCase() === 'yes' || updateToAdmin.toLowerCase() === 'y') {
        await existingUser.update({ 
          role: 'admin', 
          isVerified: true 
        })
        console.log('\n✅ User converted to admin successfully!')
        console.log('📧 Email:', existingUser.email)
        console.log('👤 Role:', existingUser.role)
        rl.close()
        process.exit(0)
      } else {
        console.log('❌ Operation cancelled')
        rl.close()
        process.exit(1)
      }
    }

    const phone = await question('Phone Number (e.g., 09123456789): ')
    const phoneRegex = /^(\+?95|0?9)\d{7,10}$/
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      console.log('❌ Invalid Myanmar phone number format')
      rl.close()
      process.exit(1)
    }

    let password = await question('Password (min 8 chars, include uppercase, lowercase, number, special char): ')
    
    // Validate password
    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters')
      rl.close()
      process.exit(1)
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      console.log('❌ Password must include:')
      console.log('  - At least one uppercase letter')
      console.log('  - At least one lowercase letter')
      console.log('  - At least one number')
      console.log('  - At least one special character')
      rl.close()
      process.exit(1)
    }

    const confirmPassword = await question('Confirm Password: ')
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match')
      rl.close()
      process.exit(1)
    }

    console.log('\n📝 Creating admin user...')

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create admin user
    const admin = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('================================')
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('📱 Phone:', admin.phone)
    console.log('🔑 Role:', admin.role)
    console.log('✓ Verified:', admin.isVerified)
    console.log('================================')
    console.log('\n🔗 You can now login at: http://localhost:3000/admin/login')
    console.log('\n⚠️  IMPORTANT: Keep your credentials safe!\n')

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message)
    rl.close()
    process.exit(1)
  }
}

// Run the script
createAdminUser()
