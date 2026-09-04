"use client"

interface AdminHeaderProps {
  user: {
    name: string
    email: string
  }
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border-b border-border py-4 px-6 sm:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{currentDate}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground text-xs font-medium">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>System Active</span>
        </div>

        {/* Quick Admin Profile Tag */}
        <div className="flex items-center gap-2.5 bg-card border border-border px-3 py-1.5 rounded-full text-xs font-medium text-foreground shadow-2xs">
          <div className="size-6 rounded-full bg-primary text-primary-foreground font-semibold text-[11px] flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span>{user.name}</span>
        </div>
      </div>
    </header>
  )
}
