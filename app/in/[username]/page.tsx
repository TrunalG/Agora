import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { MapPin, Link as LinkIcon, Users } from 'lucide-react'
import Link from 'next/link'

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  await connectDB()
  const username = decodeURIComponent(params.username).toLowerCase()
  const user = await User.findOne({ username })

  if (!user || user.profileVisibility === 'private') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-card max-w-md w-full rounded-2xl border border-border p-8 text-center space-y-4 shadow-xs">
          <div className="size-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold text-2xl">
            !
          </div>
          <h1 className="text-xl font-bold text-foreground">Profile Unavailable</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This profile does not exist or has been set to private by its owner.
          </p>
          <Link
            href="/"
            className="inline-block w-full bg-primary text-primary-foreground font-bold text-xs py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  const initials = (user.name || user.username || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between pb-2">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
            Agora
          </Link>
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Explore Members
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Profile Avatar */}
            <div className="size-24 rounded-full overflow-hidden border border-border shrink-0 bg-muted/20">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name || user.username} className="size-full object-cover" />
              ) : (
                <div className="flex items-center justify-center font-bold text-2xl size-full bg-accent text-accent-foreground">
                  {initials}
                </div>
              )}
            </div>

            {/* Profile Meta Details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-2xl font-extrabold text-foreground">{user.name || user.username}</h1>
                {user.pronouns && (
                  <span className="text-xs text-muted-foreground font-semibold">({user.pronouns})</span>
                )}
              </div>
              <p className="text-sm text-foreground font-medium">{user.bio || 'Agora Member'}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary" /> {user.country || 'Global'}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="border-t border-border pt-6 space-y-2">
            <h2 className="text-sm font-bold text-foreground">About</h2>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {user.about || 'No description provided.'}
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid gap-6 sm:grid-cols-2 border-t border-border pt-6">
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Teaches</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skillsToTeach.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg">
                    {s}
                  </span>
                ))}
                {user.skillsToTeach.length === 0 && <span className="text-xs text-muted-foreground">None listed</span>}
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Wants to Learn</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skillsToLearn.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-[10px] font-semibold rounded-lg">
                    {s}
                  </span>
                ))}
                {user.skillsToLearn.length === 0 && <span className="text-xs text-muted-foreground">None listed</span>}
              </div>
            </div>
          </div>

          {/* Portfolio Links */}
          {user.links && user.links.length > 0 && (
            <div className="border-t border-border pt-6 space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Portfolio & Links</h3>
              <div className="flex flex-wrap gap-2.5">
                {user.links.map((link: string, idx: number) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                  >
                    <LinkIcon className="size-3.5 text-muted-foreground" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Connect Action Bar */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Want to exchange skills? Sign up on Agora to follow and message {user.name || user.username}.
            </p>
            <Link
              href="/"
              className="w-full sm:w-auto bg-primary text-primary-foreground font-bold text-xs px-6 py-2.5 rounded-lg text-center hover:opacity-90 transition-opacity shadow-xs"
            >
              Connect on Agora
            </Link>
          </div>

        </div>

      </div>
    </div>
  )
}
