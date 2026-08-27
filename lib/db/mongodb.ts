import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env')
  }

  if (!cached.promise) {

    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

/**
 * Safely resolves a user from MongoDB by ObjectId or prototype string slug ('maya', 'jordan', etc.).
 * Prevents Mongoose CastError exceptions when seed demo identifiers are passed.
 * Auto-creates seed user document in MongoDB if not yet present.
 */
export async function findUserByIdOrSlug(idOrSlug: string) {
  if (!idOrSlug || typeof idOrSlug !== 'string') return null

  // Ensure DB connection is active
  await connectDB()

  const User = mongoose.models.User || mongoose.model('User')

  // 1. If valid 24-character hexadecimal ObjectId, query by _id
  if (mongoose.Types.ObjectId.isValid(idOrSlug) && String(new mongoose.Types.ObjectId(idOrSlug)) === idOrSlug) {
    const user = await User.findById(idOrSlug)
    if (user) return user
  }

  // 2. Map prototype demo string IDs to usernames
  const prototypeMap: Record<string, string> = {
    maya: 'mayachen',
    jordan: 'jordanlee',
    priya: 'priyashah',
    sam: 'samrivera',
    alex: 'alexmorgan',
    nora: 'norawilliams',
    sarah: 'sarah',
    professor: 'professor',
    founder: 'founder',
  }

  const targetUsername = prototypeMap[idOrSlug.toLowerCase()] || idOrSlug.toLowerCase()

  // 3. Search DB by username
  let user = await User.findOne({
    $or: [{ username: targetUsername }, { username: idOrSlug.toLowerCase() }],
  })

  // 4. Auto-seed demo user into MongoDB if not found
  if (!user) {
    const seed = [
      { id: 'maya', name: 'Maya Chen', username: 'mayachen', role: 'UX Specialist', location: 'Canada', teaches: ['Figma', 'UI Design'], learns: ['Python', 'Data Visualization'], about: 'Lead product designer passionate about user-centric design system & accessibility.' },
      { id: 'jordan', name: 'Jordan Lee', username: 'jordanlee', role: 'Full Stack Dev', location: 'United States', teaches: ['React', 'TypeScript', 'Node.js'], learns: ['Machine Learning', 'Docker'], about: 'Building web apps for 6+ years. Excited to share frontend knowledge.' },
      { id: 'priya', name: 'Priya Shah', username: 'priyashah', role: 'Data Analyst', location: 'India', teaches: ['Python', 'SQL', 'Data Visualization'], learns: ['React', 'Figma'], about: 'Data analyst working with Python/SQL. Want to level up UI skills.' },
      { id: 'sam', name: 'Sam Rivera', username: 'samrivera', role: 'DevOps Engineer', location: 'Germany', teaches: ['Docker', 'Kubernetes'], learns: ['TypeScript', 'UI Design'], about: 'DevOps enthusiast focused on cloud architecture and CI/CD automation.' },
      { id: 'alex', name: 'Alex Morgan', username: 'alexmorgan', role: 'Mobile Developer', location: 'United Kingdom', teaches: ['React Native', 'Swift'], learns: ['SQL', 'Node.js'], about: 'iOS & React Native engineer looking to expand backend skill set.' },
      { id: 'nora', name: 'Nora Williams', username: 'norawilliams', role: 'Content Strategist', location: 'Australia', teaches: ['Copywriting', 'SEO'], learns: ['Figma', 'Python'], about: 'Digital marketer helping startups craft powerful brand narratives.' },
      { id: 'sarah', name: 'Sarah Jenkins', username: 'sarah', role: 'UI/UX Designer @ DesignCorp', location: 'Canada', teaches: ['Figma', 'Design systems', 'User research'], learns: ['React', 'TypeScript'], about: 'Senior UI/UX designer with 5+ years of experience designing high-converting dashboards and websites. Happy to share my design systems best practices.' },
      { id: 'professor', name: 'University Professor', username: 'professor', role: 'Higher Education Industry', location: 'United States', teaches: ['Public speaking', 'Storytelling', 'Copywriting'], learns: ['Figma', 'Data visualization'], about: 'Higher education professor specializing in professional communications and business ethics. Interested in modern digital tools and UX writing.' },
      { id: 'founder', name: 'Software Founder', username: 'founder', role: 'Development & Strategy', location: 'Australia', teaches: ['Go-to-market', 'Marketing', 'Brand strategy'], learns: ['React', 'TypeScript'], about: 'Early-stage SaaS founder and product architect. Helping builders craft clear value propositions and reach their first 1,000 customers.' }
    ].find((p) => p.id === idOrSlug || p.username === targetUsername || p.username.toLowerCase() === targetUsername)

    if (seed) {
      try {
        user = await User.create({
          username: seed.username,
          name: seed.name,
          email: `${seed.username}@example.com`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuv', // placeholder hash
          bio: seed.about,
          country: seed.location === 'Anywhere' ? 'United States' : seed.location,
          skillsToLearn: seed.learns,
          skillsToTeach: seed.teaches,
          links: [],
          onboarded: true,
        })
      } catch {
        // If race condition created it concurrently, fetch again
        user = await User.findOne({ username: seed.username })
      }
    }
  }

  return user
}
