import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure upload directories exist
const uploadDir = 'uploads'
const logosDir = path.join(uploadDir, 'logos')
const signaturesDir = path.join(uploadDir, 'signatures')      
const certificatesDir = path.join(uploadDir, 'certificates')  

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir)
if (!fs.existsSync(signaturesDir)) fs.mkdirSync(signaturesDir)           
if (!fs.existsSync(certificatesDir)) fs.mkdirSync(certificatesDir)       

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on fieldname
    if (file.fieldname === 'signature') {
      cb(null, signaturesDir)                    
    } else if (file.fieldname === 'logo') {
      cb(null, logosDir)
    } else {
      cb(null, uploadDir)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const prefix = file.fieldname === 'signature' ? 'signature-' : 'logo-'  
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'))
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB - increased for signatures
  },
  fileFilter
})
