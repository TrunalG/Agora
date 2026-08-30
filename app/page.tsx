"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

// Mock Data for Interactive Match Simulator
const SIMULATOR_DATA = {
  design: {
    tabLabel: 'UI/UX & Product Design',
    matchScore: 95,
    userLeft: {
      initials: 'AM',
      name: 'Alex Morgan',
      role: 'Product Manager',
      location: 'Chicago, IL',
      teaches: ['Roadmapping', 'User interviews'],
      learns: ['Figma', 'React']
    },
    userRight: {
      initials: 'SJ',
      name: 'Sarah Jenkins',
      role: 'UI/UX Designer',
      location: 'Toronto, CA',
      teaches: ['Figma', 'Design systems'],
      learns: ['React', 'TypeScript']
    }
  },
  engineering: {
    tabLabel: 'Frontend & Systems Eng',
    matchScore: 90,
    userLeft: {
      initials: 'JL',
      name: 'Jordan Lee',
      role: 'Software Engineer',
      location: 'Austin, TX',
      teaches: ['React', 'TypeScript', 'Next.js'],
      learns: ['Photography', 'Brand strategy']
    },
    userRight: {
      initials: 'SR',
      name: 'Sam Rivera',
      role: 'Photographer',
      location: 'Los Angeles, CA',
      teaches: ['Lightroom', 'Brand strategy'],
      learns: ['Marketing', 'Notion']
    }
  },
  marketing: {
    tabLabel: 'Growth Marketing & SEO',
    matchScore: 98,
    userLeft: {
      initials: 'PS',
      name: 'Priya Shah',
      role: 'Growth Strategist',
      location: 'Boston, MA',
      teaches: ['SEO', 'Go-to-market', 'Copywriting'],
      learns: ['Figma', 'Data visualization']
    },
    userRight: {
      initials: 'MC',
      name: 'Maya Chen',
      role: 'Product Designer',
      location: 'Brooklyn, NY',
      teaches: ['Figma', 'User research'],
      learns: ['SEO', 'Webflow']
    }
  }
}

export default function LandingPage() {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'design' | 'engineering' | 'marketing'>('design')
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            router.push('/app')
            return
          }
        }
      } catch (err) {
        console.error('Session check failed:', err)
      } finally {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router])

  // Trigger brief animation pulse when switching simulator tabs
  const handleTabChange = (tab: 'design' | 'engineering' | 'marketing') => {
    if (tab === activeTab) return
    setPulsing(true)
    setActiveTab(tab)
    setTimeout(() => setPulsing(false), 400)
  }

  // Smooth scroll handler
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-xs text-muted-foreground tracking-wider uppercase font-medium">Authenticating...</p>
        </div>
      </div>
    )
  }

  const currentSim = SIMULATOR_DATA[activeTab]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-secondary/60 selection:text-secondary-foreground scroll-smooth">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <span className="font-extrabold text-xl tracking-tight text-primary transition-colors group-hover:text-primary/80">Agora</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a
                href="#features"
                onClick={(e) => handleScroll(e, 'features')}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleScroll(e, 'how-it-works')}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                How it works
              </a>
              <a
                href="#testimonials"
                onClick={(e) => handleScroll(e, 'testimonials')}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Testimonials
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/app?mode=login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Log In
            </Link>
            <Link
              href="/app?mode=register"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <span className="text-xl font-light">✕</span>
              ) : (
                <div className="flex flex-col gap-1 w-5">
                  <span className="h-0.5 w-full bg-current"></span>
                  <span className="h-0.5 w-full bg-current"></span>
                  <span className="h-0.5 w-full bg-current"></span>
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-background/98 md:hidden border-t border-border animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 p-6 text-base font-semibold">
            <a
              href="#features"
              onClick={(e) => handleScroll(e, 'features')}
              className="border-b border-border/50 pb-2 text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleScroll(e, 'how-it-works')}
              className="border-b border-border/50 pb-2 text-muted-foreground hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleScroll(e, 'testimonials')}
              className="border-b border-border/50 pb-2 text-muted-foreground hover:text-foreground"
            >
              Testimonials
            </a>
            <Link
              href="/app?mode=login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted/40 transition-all cursor-pointer"
            >
              Log In
            </Link>
            <Link
              href="/app?mode=register"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Copy Block */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-semibold text-muted-foreground tracking-wide w-fit mb-6 shadow-2xs">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Professional Expertise Trade
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
                Trade expertise, not equity.<br />
                Build faster together.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
                Agora is a high-value skill exchange for developers, designers, and builders. Swap development hours for premium UI design, SEO strategy, or branding advice. No tokens, no hidden transaction fees—just reciprocal professional leverage.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/app?mode=register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/95 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md cursor-pointer group"
                >
                  Join the Exchange
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/app"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted/10 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  Explore the Directory
                </Link>
              </div>
            </div>

            {/* Interactive Match Simulator */}
            <div className="mt-16 lg:mt-0 lg:col-span-5 flex flex-col items-center">
              
              {/* Simulator Tabs Selector */}
              <div className="flex w-full justify-between bg-card border border-border p-1 rounded-xl mb-4 shadow-3xs max-w-md">
                {(Object.keys(SIMULATOR_DATA) as Array<keyof typeof SIMULATOR_DATA>).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleTabChange(key)}
                    className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === key
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {key === 'design' ? 'Design' : key === 'engineering' ? 'Engineers' : 'Marketing'}
                  </button>
                ))}
              </div>

              {/* Match Visual Panel */}
              <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-md hover:shadow-lg transition-all duration-300 group">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="size-2 rounded-full bg-border/80"></span>
                  <span className="size-2 rounded-full bg-border/80"></span>
                  <span className="size-2 rounded-full bg-border/80"></span>
                </div>
                
                <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-6 flex items-center gap-1.5">
                  <span>Match Explorer</span>
                  <span className="px-1.5 py-0.5 rounded-sm bg-secondary/60 text-secondary-foreground text-[9px]">Interactive Demo</span>
                </h3>

                <div className={`flex flex-col gap-6 relative transition-all duration-300 ${pulsing ? 'opacity-40 scale-98' : 'opacity-100 scale-100'}`}>
                  {/* Member Left Card */}
                  <div className="rounded-xl border border-border bg-background p-4 relative z-10 hover:border-primary/20 transition-all shadow-3xs">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-secondary/80 font-extrabold text-xs text-primary ring-1 ring-border">
                        {currentSim.userLeft.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-foreground">{currentSim.userLeft.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{currentSim.userLeft.role} • {currentSim.userLeft.location}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {currentSim.userLeft.teaches.map((skill) => (
                        <span key={skill} className="rounded bg-accent/40 px-2 py-0.5 text-[9px] font-semibold text-accent-foreground border border-accent/20">Teaches {skill}</span>
                      ))}
                      {currentSim.userLeft.learns.map((skill) => (
                        <span key={skill} className="rounded bg-secondary/30 px-2 py-0.5 text-[9px] font-medium text-secondary-foreground">Wants {skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Connecting Line Graphic */}
                  <div className="absolute left-[30px] top-[50px] bottom-[50px] w-0.5 bg-border/60 border-dashed border-l z-0"></div>
                  
                  {/* Central Match Badge with Pulsing Ring */}
                  <div className="absolute left-[13px] top-[74px] z-20 flex h-6 w-9 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground tracking-tight shadow-sm hover:scale-105 transition-transform cursor-pointer">
                    ⚡ {currentSim.matchScore}%
                  </div>

                  {/* Member Right Card */}
                  <div className="rounded-xl border border-border bg-background p-4 relative z-10 hover:border-primary/20 transition-all shadow-3xs">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-secondary/80 font-extrabold text-xs text-primary ring-1 ring-border">
                        {currentSim.userRight.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-foreground">{currentSim.userRight.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{currentSim.userRight.role} • {currentSim.userRight.location}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {currentSim.userRight.teaches.map((skill) => (
                        <span key={skill} className="rounded bg-accent/40 px-2 py-0.5 text-[9px] font-semibold text-accent-foreground border border-accent/20">Teaches {skill}</span>
                      ))}
                      {currentSim.userRight.learns.map((skill) => (
                        <span key={skill} className="rounded bg-secondary/30 px-2 py-0.5 text-[9px] font-medium text-secondary-foreground">Wants {skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-20 bg-muted/20 border-t border-b border-border/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Designed for professional builders
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              No transactions, tokens, or transactional friction. Agora matches reciprocal needs so you can focus on building products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 - Smart Matchmaking (Col-span 2) */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-3xs hover:-translate-y-1 hover:shadow-xs hover:border-primary/20 transition-all duration-300 group">
              <div>
                {/* Styled Custom Visual Element (Overlapping Venn / Match Indicator) */}
                <div className="flex items-center gap-1.5 mb-5 w-fit">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/80 border border-border font-bold text-primary text-xs">
                    Teaches
                  </div>
                  <div className="h-0.5 w-6 bg-border border-dashed border-b"></div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground font-black">
                    ⚡
                  </div>
                  <div className="h-0.5 w-6 bg-border border-dashed border-b"></div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/80 border border-border font-bold text-primary text-xs">
                    Learns
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">Automated Direct Alignment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Agora calculates compatibility scores instantly. When you explore profiles, our algorithm surfaces the exact overlap: showing you who possesses the skills you want to learn, and wants the exact experience you are ready to teach.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex gap-6 items-center">
                <div className="flex -space-x-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[9px] font-extrabold ring-2 ring-card border border-border/40">MC</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[9px] font-extrabold ring-2 ring-card border border-border/40">JL</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-accent text-[9px] font-extrabold ring-2 ring-card border border-border/40">PS</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Join 3,000+ builders trading skills globally</span>
              </div>
            </div>

            {/* Feature 2 - Guarded Messaging (Col-span 1) */}
            <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-3xs hover:-translate-y-1 hover:shadow-xs hover:border-primary/20 transition-all duration-300 group">
              <div>
                {/* Styled Custom Visual Element (Mini Chat Mockup UI) */}
                <div className="flex flex-col gap-1.5 mb-5 w-28 bg-background p-2 rounded-lg border border-border/50">
                  <div className="h-2 w-14 bg-secondary rounded-sm"></div>
                  <div className="h-3 w-20 bg-muted/80 rounded-sm self-end"></div>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">Guarded Chat Inboxes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Protect your workspace from unsolicited pitches. Inbox channels open dynamically only after both users agree to connect, keeping communication focused on the exchange.
                </p>
              </div>
              <div className="mt-8 text-[11px] font-bold text-primary tracking-wide uppercase">
                Zero pitch guarantee
              </div>
            </div>

            {/* Feature 3 - Trust & Visibility (Col-span 1) */}
            <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-3xs hover:-translate-y-1 hover:shadow-xs hover:border-primary/20 transition-all duration-300 group">
              <div>
                {/* Styled Custom Visual Element (Toggle Mockup UI) */}
                <div className="flex items-center justify-between mb-5 w-32 bg-background p-2 rounded-lg border border-border/50">
                  <span className="text-[9px] font-bold text-muted-foreground">Workspace visibility</span>
                  <div className="w-6 h-3 bg-primary rounded-full relative flex items-center px-0.5">
                    <span className="size-2 bg-primary-foreground rounded-full translate-x-3 transition-transform"></span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">Privacy & Workspace Controls</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configure workspace settings to match your workflow. Switch profiles to private, block users, and access strict reporting options to maintain a high-quality collaborating network.
                </p>
              </div>
              <div className="mt-8 text-[11px] font-bold text-primary tracking-wide uppercase">
                Flexible privacy settings
              </div>
            </div>

            {/* Feature 4 - Search Filtering (Col-span 2) */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-3xs hover:-translate-y-1 hover:shadow-xs hover:border-primary/20 transition-all duration-300 group">
              <div>
                {/* Styled Custom Visual Element (Pill search indicators) */}
                <div className="flex items-center gap-2 mb-5 w-full max-w-xs bg-background p-2 rounded-lg border border-border/50 text-[10px] text-muted-foreground">
                  <span className="font-semibold text-foreground border-r border-border pr-2">Search</span>
                  <span>Figma, Python, Austin...</span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">Targeted Search & Filtering</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Find the exact expertise you need. Filter our directory by location, matching skills to teach, or specific skills you are looking to acquire. Drill down to specific countries to coordinate in local timezones.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">📍 Location Filter</span>
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">🎓 Expertise Tags</span>
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">⚡ Compatibility Score</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Reciprocal Leverage: How it works
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We focus on reciprocal learning. Here is how you start exchanging knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary font-extrabold text-sm text-primary-foreground mb-6 shadow-xs group-hover:scale-105 transition-transform duration-300">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">List your expertise</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                List the technical, design, or business skills you have mastered, along with the topics you want to learn. Set your country and complete your profile checklist.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary font-extrabold text-sm text-primary-foreground mb-6 shadow-xs group-hover:scale-105 transition-transform duration-300">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Send custom trade requests</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Search the directory and view compatibility. Send connection requests to matched members with a personalized note proposing the terms of the swap.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary font-extrabold text-sm text-primary-foreground mb-6 shadow-xs group-hover:scale-105 transition-transform duration-300">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Exchange knowledge</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Once accepted, your direct messaging channel opens. Coordinate details, hop on a call, review design layouts, or run paired programming sessions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/20 border-t border-b border-border/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Real exchanges, real leverage
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              See how other builders are trading skills to construct products without cash spend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-3xs hover:-translate-y-1 hover:shadow-xs hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "I needed to build a React landing page for my new micro-SaaS. Through Agora, I connected with Jordan who needed an expert UI review of his design system. We swapped skills, and I saved $2k in development fees."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/40 text-xs font-bold text-accent-foreground border border-accent/20">
                  MC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Maya Chen</h4>
                  <p className="text-[10px] text-muted-foreground">Product Designer • Brooklyn, NY</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-3xs hover:-translate-y-1 hover:shadow-xs hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "Figma was a bottleneck for my frontend engineering work. I helped Sam optimize his landing page copy and set up his marketing flow, and in exchange, he gave me structured mentorship on layout systems. Absolute game-changer."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/40 text-xs font-bold text-accent-foreground border border-accent/20">
                  JL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Jordan Lee</h4>
                  <p className="text-[10px] text-muted-foreground">Software Engineer • Austin, TX</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-3xs hover:-translate-y-1 hover:shadow-xs hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "Finding high-quality creators to share knowledge with is usually filled with transaction fees, token models, or sales pitches. Agora is just straight value trade. I swapped SEO tips for design assets cleanly."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/40 text-xs font-bold text-accent-foreground border border-accent/20">
                  PS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Priya Shah</h4>
                  <p className="text-[10px] text-muted-foreground">Growth Strategist • Boston, MA</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-16 text-center shadow-lg max-w-4xl mx-auto hover:border-primary/10 transition-all duration-300">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Trade your skills. Build your product.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              Join a verified community of developers, designers, and growth marketers trading knowledge to build their side projects and micro-SaaS.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/app?mode=register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/95 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md cursor-pointer"
              >
                Create Free Account
              </Link>
              <Link
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground hover:bg-muted/10 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                Browse Members
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground tracking-tight">Agora</span>
            <span>&copy; {new Date().getFullYear()} Agora Platform. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="mailto:support@agora.exchange" className="hover:text-foreground">Feedback & Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
