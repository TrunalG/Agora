export type Person = {
  id: string
  name: string
  username: string
  role: string
  location: string
  initials: string
  tone: string
  teaches: string[]
  learns: string[]
  about: string
  image?: string
  links?: string[]
  connectionsCount?: number
  email?: string
  pronouns?: string
  language?: string
  profileVisibility?: 'public' | 'private'
  notificationPreference?: boolean
  appearancePreference?: 'light' | 'dark' | 'system'
  accountRole?: string
}

export type Request = { id: string; senderId: string; receiverId: string; message: string; status: 'pending' | 'accepted' | 'rejected'; createdAt: number }
export type Conversation = { id: string; participantId: string; messages: { id: string; senderId: string; content: string; createdAt: number }[] }

export const skills = ['Figma', 'Design systems', 'User research', 'Webflow', 'React', 'TypeScript', 'Accessibility', 'Photography', 'Brand strategy', 'SEO', 'Go-to-market', 'Copywriting', 'Data visualization', 'Portraits', 'Lightroom', 'Storytelling', 'Marketing', 'Notion', 'Roadmapping', 'User interviews', 'SQL', 'UX writing', 'Content strategy', 'Illustration', 'Python', 'Public speaking', 'Excel', 'Spanish', 'French']
export const countries = ['Anywhere', 'United States', 'Canada', 'United Kingdom', 'India', 'Australia']

export const people: Person[] = [
  { id: 'maya', name: 'Maya Chen', username: 'mayachen', role: 'Product designer', location: 'Brooklyn, NY', initials: 'MC', tone: 'bg-accent text-accent-foreground', teaches: ['Figma', 'Design systems', 'User research'], learns: ['Webflow', 'Public speaking'], about: 'I make complex products feel simple. Looking to trade design systems expertise for stronger storytelling and Webflow skills.' },
  { id: 'jordan', name: 'Jordan Lee', username: 'jordanlee', role: 'Frontend engineer', location: 'Austin, TX', initials: 'JL', tone: 'bg-secondary text-secondary-foreground', teaches: ['React', 'TypeScript', 'Accessibility'], learns: ['Brand strategy', 'Photography'], about: 'Building inclusive interfaces by day, learning the creative side of product by night.' },
  { id: 'priya', name: 'Priya Shah', username: 'priyashah', role: 'Growth strategist', location: 'Toronto, CA', initials: 'PS', tone: 'bg-muted text-foreground', teaches: ['SEO', 'Go-to-market', 'Copywriting'], learns: ['Figma', 'Data visualization'], about: 'Growth strategist who loves a good experiment. I can help you find your audience and tell a sharper story.' },
  { id: 'sam', name: 'Sam Rivera', username: 'samrivera', role: 'Photographer', location: 'Los Angeles, CA', initials: 'SR', tone: 'bg-accent text-accent-foreground', teaches: ['Portraits', 'Lightroom', 'Storytelling'], learns: ['Marketing', 'Notion'], about: 'Photographer, storyteller, and curious generalist. Always up for making something together.' },
  { id: 'alex', name: 'Alex Morgan', username: 'alexmorgan', role: 'Product manager', location: 'Chicago, IL', initials: 'AM', tone: 'bg-secondary text-secondary-foreground', teaches: ['Roadmapping', 'User interviews'], learns: ['React', 'SQL'], about: 'PM focused on early-stage products. I learn best by doing and sharing what I know.' },
  { id: 'nora', name: 'Nora Williams', username: 'norawilliams', role: 'Content designer', location: 'London, UK', initials: 'NW', tone: 'bg-muted text-foreground', teaches: ['UX writing', 'Content strategy'], learns: ['SEO', 'Illustration'], about: 'Words are my medium. I am here to swap notes, practice new skills, and meet thoughtful people.' },
  { id: 'sarah', name: 'Sarah Jenkins', username: 'sarah', role: 'UI/UX Designer @ DesignCorp', location: 'Canada', initials: 'SJ', tone: 'bg-accent text-accent-foreground', teaches: ['Figma', 'Design systems', 'User research'], learns: ['React', 'TypeScript'], about: 'Senior UI/UX designer with 5+ years of experience designing high-converting dashboards and websites. Happy to share my design systems best practices.' },
  { id: 'professor', name: 'University Professor', username: 'professor', role: 'Higher Education Industry', location: 'United States', initials: 'UP', tone: 'bg-secondary text-secondary-foreground', teaches: ['Public speaking', 'Storytelling', 'Copywriting'], learns: ['Figma', 'Data visualization'], about: 'Higher education professor specializing in professional communications and business ethics. Interested in modern digital tools and UX writing.' },
  { id: 'founder', name: 'Software Founder', username: 'founder', role: 'Development & Strategy', location: 'Australia', initials: 'SF', tone: 'bg-muted text-foreground', teaches: ['Go-to-market', 'Marketing', 'Brand strategy'], learns: ['React', 'TypeScript'], about: 'Early-stage SaaS founder and product architect. Helping builders craft clear value propositions and reach their first 1,000 customers.' },
]

export function calculateMatch(me: Person, other: Person) {
  const matchingTeaches = other.teaches.filter((skill) => me.learns.some((wanted) => wanted.toLowerCase() === skill.toLowerCase()))
  const matchingLearns = other.learns.filter((wanted) => me.teaches.some((skill) => skill.toLowerCase() === wanted.toLowerCase()))

  const forward = matchingTeaches.length > 0
  const reverse = matchingLearns.length > 0

  if (forward && reverse) return `⚡ Strong match (${matchingTeaches[0]} ↔ ${matchingLearns[0]})`
  if (forward) return `🎓 Can teach you ${matchingTeaches.slice(0, 2).join(', ')}`
  if (reverse) return `💡 Wants to learn ${matchingLearns.slice(0, 2).join(', ')}`
  return ''
}

export function getMatchScore(me: Person, other: Person): number {
  const matchingTeaches = other.teaches.filter((skill) => me.learns.some((wanted) => wanted.toLowerCase() === skill.toLowerCase()))
  const matchingLearns = other.learns.filter((wanted) => me.teaches.some((skill) => skill.toLowerCase() === wanted.toLowerCase()))

  if (matchingTeaches.length > 0 && matchingLearns.length > 0) return 95
  if (matchingTeaches.length > 0 || matchingLearns.length > 0) return 75
  return 0
}

export function getProfileCompletion(profile: { username: string; image?: string; bio: string; country: string; learns: string[]; teaches: string[]; links?: string[] }) {
  const required = [
    Boolean(profile.username?.trim()),
    Boolean(profile.bio?.trim()),
    Boolean(profile.country?.trim() && profile.country !== 'Select your country' && profile.country !== 'Anywhere'),
    Boolean(profile.learns && profile.learns.length > 0),
    Boolean(profile.teaches && profile.teaches.length > 0),
  ]
  const completed = required.filter(Boolean).length
  return Math.round((completed / required.length) * 100)
}

export function getProfileChecklist(profile: { username: string; image?: string; bio: string; country: string; learns: string[]; teaches: string[]; links?: string[] }) {
  return [
    { id: 'username', label: 'Set your unique username', hint: 'Add a custom username so members can identify you.', complete: Boolean(profile.username?.trim()) },
    { id: 'country', label: 'Select your country / location', hint: 'Choose your location to match with local or global learners.', complete: Boolean(profile.country?.trim() && profile.country !== 'Select your country' && profile.country !== 'Anywhere') },
    { id: 'bio', label: 'Write a bio & intro', hint: 'Introduce yourself and share your background or goals.', complete: Boolean(profile.bio?.trim()) },
    { id: 'learns', label: 'Add skills you want to learn', hint: 'List at least 1 skill you are interested in learning.', complete: Boolean(profile.learns && profile.learns.length > 0) },
    { id: 'teaches', label: 'Add skills you can teach', hint: 'List at least 1 skill you can share or mentor others in.', complete: Boolean(profile.teaches && profile.teaches.length > 0) },
  ]
}


