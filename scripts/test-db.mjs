import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {
  // ignore
}

// Helper to parse .env file manually if dotenv is not used
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (key && !process.env[key]) {
        process.env[key] = val
      }
    }
  })
}

loadEnv()

const uri = process.env.MONGODB_URI

console.log('\n--- MongoDB Connection Test ---')
if (!uri || uri.trim() === '') {
  console.error('❌ MONGODB_URI is EMPTY or missing in your .env file!')
  console.log('Please save your .env file after setting MONGODB_URI, e.g.:')
  console.log('MONGODB_URI=mongodb://127.0.0.1:27017/skill-exchange  (for local MongoDB)')
  console.log('OR')
  console.log('MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skill-exchange (for MongoDB Atlas)\n')
  process.exit(1)
}

console.log(`Connecting to: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`)

async function testConnection() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ SUCCESS: Connected to MongoDB successfully!')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌ ERROR: Failed to connect to MongoDB.')
    console.error(err.message)
    process.exit(1)
  }
}

testConnection()
