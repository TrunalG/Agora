"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Menu,
  X,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'

// Professional members dataset for the Match Simulator
const simulatorData = [
  {
    name: 'Maya Chen',
    initials: 'MC',
    role: 'Product Designer',
    location: 'Brooklyn, NY',
    teaches: 'Design Systems',
    learns: 'React',
    avatarBg: 'bg-accent/40 text-accent-foreground',
    about: 'I design components in Figma and build design systems. Swapping for React component styling.'
  },
  {
    name: 'Jordan Lee',
    initials: 'JL',
    role: 'Frontend Engineer',
    location: 'Austin, TX',
    teaches: 'React',
    learns: 'Design Systems',
    avatarBg: 'bg-secondary/40 text-secondary-foreground',
    about: 'Responsive React app development. Ready to swap tips for design system component tokens.'
  },
  {
    name: 'Priya Shah',
    initials: 'PS',
    role: 'Growth Strategist',
    location: 'Toronto, CA',
    teaches: 'Marketing',
    learns: 'Copywriting',
    avatarBg: 'bg-muted/40 text-foreground',
    about: 'Startup growth frameworks and organic traffic loops. Swap for high-conversion landing page copy.'
  },
  {
    name: 'Sam Rivera',
    initials: 'SR',
    role: 'SaaS Copywriter',
    location: 'Los Angeles, CA',
    teaches: 'Copywriting',
    learns: 'Marketing',
    avatarBg: 'bg-accent/40 text-accent-foreground',
    about: 'Converting features into benefits. Swap for growth funnel advice and marketing tactics.'
  },
  {
    name: 'Nora Williams',
    initials: 'NW',
    role: 'Content Designer',
    location: 'London, UK',
    teaches: 'UX Writing',
    learns: 'SEO',
    avatarBg: 'bg-muted/40 text-foreground',
    about: 'Microcopy flows and information architecture. Swapping copy help for SEO strategy.'
  },
  {
    name: 'Alex Morgan',
    initials: 'AM',
    role: 'SEO Consultant',
    location: 'Chicago, IL',
    teaches: 'SEO',
    learns: 'UX Writing',
    avatarBg: 'bg-secondary/40 text-secondary-foreground',
    about: 'Optimizing sites for search visibility. Eager to swap for UX writing best practices.'
  }
]

// Professional testimonials dataset
const testimonials = [
  {
    quote: "I wanted to learn Webflow to turn my static layouts into live sites. I connected with Jordan who wanted design system guidance. In three weeks, I built my first portfolio and helped him clean up his design assets.",
    name: "Maya Chen",
    initials: "MC",
    role: "Product Designer",
    location: "Brooklyn, NY"
  },
  {
    quote: "Growth marketing was a mystery to me. Through Agora, I found Priya who was writing a copy guide but struggled with dashboard design. I did her layout UI, and she reviewed my SEO configuration. Great trade.",
    name: "Jordan Lee",
    initials: "JL",
    role: "Frontend Engineer",
    location: "Austin, TX"
  },
  {
    quote: "It is hard to find high-quality learning partnerships without sales pitches. Agora's strict connection requests policy makes it a refreshing, productive space. Just pure value sharing between creators.",
    name: "Priya Shah",
    initials: "PS",
    role: "Growth Strategist",
    location: "Toronto, CA"
  },
  {
    quote: "I was designing microcopy for a finance app but needed search visibility tips. I swapped UX writing insights with an SEO consultant, and our organic search rankings improved shortly after.",
    name: "Nora Williams",
    initials: "NW",
    role: "Content Designer",
    location: "London, UK"
  },
  {
    quote: "I offered technical SEO auditing but struggled with content layout. Working with Nora helped me design clear hierarchy guides. The feedback was extremely actionable.",
    name: "Alex Morgan",
    initials: "AM",
    role: "SEO Consultant",
    location: "Chicago, IL"
  },
  {
    quote: "I trade SaaS landing page copy advice for help with React components and state setup. It saves me weeks of trying to figure out frontend quirks alone.",
    name: "Sam Rivera",
    initials: "SR",
    role: "SaaS Copywriter",
    location: "Los Angeles, CA"
  }
]

export default function LandingPage() {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Sandbox state
  const [selectedLearn, setSelectedLearn] = useState('React')
  const [selectedTeach, setSelectedTeach] = useState('Design Systems')

  // Timeline Scroll Tracking State
  const [scrollProgress, setScrollProgress] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return
      const element = timelineRef.current
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const elementHeight = rect.height

      const startTrigger = windowHeight * 0.70
      const distanceScrolled = startTrigger - rect.top
      const scrollableDistance = elementHeight - 120

      let pct = distanceScrolled / scrollableDistance
      if (pct < 0) pct = 0
      if (pct > 1) pct = 1

      setScrollProgress(pct)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    // Run initially with a tiny timeout to ensure Layout layout is finished
    const t = setTimeout(handleScroll, 50)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      clearTimeout(t)
    }
  }, [])

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

  // Resolve matching simulator user
  let activeMatch = simulatorData.find(u => u.teaches === selectedLearn && u.learns === selectedTeach)
  if (!activeMatch) {
    activeMatch = simulatorData.find(u => u.teaches === selectedLearn)
  }
  if (!activeMatch) {
    activeMatch = simulatorData.find(u => u.learns === selectedTeach)
  }
  if (!activeMatch) {
    activeMatch = simulatorData[0]
  }

  const isPerfectMatch = activeMatch.teaches === selectedLearn && activeMatch.learns === selectedTeach

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-xs text-muted-foreground tracking-wider uppercase font-medium">Loading Agora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-secondary/60 selection:text-secondary-foreground">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-extrabold text-xl tracking-tight text-primary">Agora</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
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
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
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
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-border/50 pb-2 text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-border/50 pb-2 text-muted-foreground hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
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
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center py-12 lg:py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">

            {/* Copy Block */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground tracking-wide w-fit mb-6 shadow-2xs">
                <Sparkles className="size-3 text-muted-foreground/80" /> Peer-to-Peer Skill Exchange
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-5">
                Learn new skills.<br />
                Teach what you love.<br />
                Grow your connections.
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mb-8">
                Connect directly with other builders to swap expertise. Trade what you know for what you need next, with no fees, no tokens, and no middlemen.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Link
                  href="/app?mode=register"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm cursor-pointer group active:scale-[0.98]"
                >
                  Join the Exchange
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/app"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-muted/20 transition-all cursor-pointer active:scale-[0.98]"
                >
                  Browse Members
                </Link>
              </div>
            </div>

            {/* Interactive Exchange Sandbox */}
            <div className="mt-16 lg:mt-0 lg:col-span-6 flex justify-center relative">

              {/* Sticker 1: Define what you learn (Top Left) */}
              <div className="absolute top-10 -left-28 hidden xl:flex flex-col gap-0.5 rounded-lg border border-border/80 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs -rotate-2 select-none z-20">
                <span>Define what you learn</span>
                <span className="text-[10px] text-muted-foreground font-normal">Select skills you need to master</span>
              </div>
              <svg className="absolute top-16 -left-12 w-28 h-20 hidden xl:block text-muted-foreground/30 z-20" viewBox="0 0 110 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 15,10 C 10,30 40,65 90,50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M 80,42 L 90,50 L 80,58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              {/* Sticker 2: Offer what you teach (Right Side) */}
              <div className="absolute top-[26%] -right-20 -translate-y-1/2 hidden xl:flex flex-col gap-0.5 rounded-lg border border-border/80 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs rotate-2 select-none z-20">
                <span>Offer what you teach</span>
                <span className="text-[10px] text-muted-foreground font-normal">List expertise you can share</span>
              </div>
              <svg className="absolute top-[28%] -right-6 w-24 h-24 hidden xl:block text-muted-foreground/30 z-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 80,10 C 85,35 65,70 15,60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M 25,52 L 15,60 L 23,70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              {/* Sticker 3: Match and swap! (Bottom Left) */}
              <div className="absolute top-[70%] -left-32 -translate-y-1/2 hidden xl:flex flex-col gap-0.5 rounded-lg border border-border/80 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs -rotate-2 select-none z-20">
                <span>See your matches</span>
                <span className="text-[10px] text-muted-foreground font-normal">Review peer profiles and connect</span>
              </div>
              <svg className="absolute top-[72%] -left-12 w-28 h-28 hidden xl:block text-muted-foreground/30 z-20" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 15,15 C 10,40 40,90 90,75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M 80,67 L 90,75 L 80,83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 z-10 relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                  <span className="text-[9px] font-mono tracking-widest text-muted-foreground font-bold uppercase">00 // MATCH SIMULATOR</span>
                  <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="space-y-4">
                  {/* Select Learn */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">1. What do you want to learn?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'Figma', 'Copywriting', 'SEO', 'UX Writing'].map((skill) => (
                        <button
                          key={skill}
                          onClick={() => setSelectedLearn(skill)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer ${selectedLearn === skill
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-102'
                              : 'bg-background hover:bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Teach */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">2. What can you teach?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Design Systems', 'React', 'Marketing', 'Copywriting', 'SEO', 'UX Writing'].map((skill) => (
                        <button
                          key={skill}
                          onClick={() => setSelectedTeach(skill)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer ${selectedTeach === skill
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-102'
                              : 'bg-background hover:bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Match Output */}
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-foreground">Matching Peer Preview</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-tight uppercase border transition-all duration-300 ${isPerfectMatch
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                        <span className="flex items-center gap-1">
                          <svg className="size-2.5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                          </svg>
                          {isPerfectMatch ? 'Perfect Match' : 'Skill Match'}
                        </span>
                      </span>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex size-8 items-center justify-center rounded-full font-bold text-[10px] ${activeMatch.avatarBg}`}>
                            {activeMatch.initials}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{activeMatch.name}</h4>
                            <p className="text-[10px] text-muted-foreground">{activeMatch.role} • {activeMatch.location}</p>
                          </div>
                        </div>
                        <Link
                          href="/app?mode=register"
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          Connect <ArrowUpRight className="size-3" />
                        </Link>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed italic mb-3">
                        "{activeMatch.about}"
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded bg-accent/40 px-2 py-0.5 text-[9px] font-semibold text-accent-foreground border border-accent/20">Teaches {activeMatch.teaches}</span>
                        <span className="rounded bg-secondary/40 px-2 py-0.5 text-[9px] font-medium text-secondary-foreground border border-secondary/20">Wants {activeMatch.learns}</span>
                      </div>
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
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Built for direct collaboration
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              No points, tokens, or subscriptions. Agora matches builders for direct, reciprocal knowledge sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1 (Col-span 2) */}
            <div className="group md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[9px] font-mono tracking-widest font-bold text-muted-foreground uppercase border border-border bg-muted/40 px-2 py-0.5 rounded">01 // AUTOMATED MATCHING</span>
                  <span className="text-[10px] text-emerald-600 font-semibold tracking-wide flex items-center gap-1">
                    <svg className="size-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    Reciprocal Match
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Smart Matchmaking Engine</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Agora computes compatibility scores instantly by checking the skills you wish to learn against what other members want to teach. Find strong, mutual pairings in seconds without manual sorting.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex gap-6 items-center">
                <div className="flex -space-x-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[9px] font-bold ring-2 ring-card">MC</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[9px] font-bold ring-2 ring-card">JL</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-accent text-[9px] font-bold ring-2 ring-card">PS</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium font-sans">Connect with a growing network of active professionals</span>
              </div>
            </div>

            {/* Feature 2 (Col-span 1) */}
            <div className="group rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[9px] font-mono tracking-widest font-bold text-muted-foreground uppercase border border-border bg-muted/40 px-2 py-0.5 rounded">02 // INBOX ISOLATION</span>
                  <span className="text-[10px] text-primary font-semibold tracking-wide">Secure</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Guarded Connection Messaging</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Send requests with personalized messages. Messaging access is guarded so your inbox stays clean until connection requests are mutually accepted.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-primary inline-flex items-center gap-1">
                Zero spam policy
              </div>
            </div>

            {/* Feature 3 (Col-span 1) */}
            <div className="group rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[9px] font-mono tracking-widest font-bold text-muted-foreground uppercase border border-border bg-muted/40 px-2 py-0.5 rounded">03 // TRUST PROTOCOLS</span>
                  <span className="text-[10px] text-primary font-semibold tracking-wide">Moderated</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Zero-Noise Safety Moderation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Protect your learning environment. Manage profile visibility (public or private), block unwanted members, and instantly flag suspicious behavior.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-primary inline-flex items-center gap-1">
                Safe learning workspace
              </div>
            </div>

            {/* Feature 4 (Col-span 2) */}
            <div className="group md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[9px] font-mono tracking-widest font-bold text-muted-foreground uppercase border border-border bg-muted/40 px-2 py-0.5 rounded">04 // ADVANCED DISCOVERY</span>
                  <span className="text-[10px] text-primary font-semibold tracking-wide">Granular</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Targeted Member Directory</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Looking for design feedback in Austin or React tutoring from London? Filter members by location, matching skills to teach, or specific skills you are looking to acquire.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex gap-4 text-xs font-medium text-muted-foreground">
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">Country Filters</span>
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">Skill Tags</span>
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">Match Score</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 border-b border-border/40 bg-muted/5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              How Agora works in three steps
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We focus on reciprocal learning. Here is how you start exchanging knowledge.
            </p>
          </div>

          {/* Interactive Scroll Timeline Container */}
          <div className="relative mt-12 max-w-4xl mx-auto" ref={timelineRef}>
            {/* Center track vertical line */}
            <div className="absolute left-8 md:left-1/2 top-5 bottom-5 w-[2px] -translate-x-1/2 bg-border/40 overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full bg-primary origin-top transition-transform duration-100 ease-out"
                style={{
                  height: '100%',
                  transform: `scaleY(${scrollProgress})`
                }}
              />
            </div>

            {/* Timeline Steps Stack */}
            <div className="space-y-20 relative">
              {[
                {
                  number: "01",
                  title: "Set up your profile",
                  description: "Create your card. Define exactly what you are building, the tools you teach, and what you need next."
                },
                {
                  number: "02",
                  title: "Find your pairing",
                  description: "Match with peers. Discover matching profiles based on reciprocated teaches/learns scores."
                },
                {
                  number: "03",
                  title: "Start the exchange",
                  description: "Swap knowledge. Connect in our secure inbox to talk, share guidance, and collaborate on your growth goals."
                }
              ].map((step, idx) => {
                const thresholds = [0.15, 0.50, 0.85];
                const isActive = scrollProgress >= thresholds[idx];

                return (
                  <div
                    key={idx}
                    className={`relative flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-700 ease-out ${isActive ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4'
                      }`}
                  >
                    {/* Content Block */}
                    <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${idx % 2 === 0
                        ? 'md:pr-12 md:text-right flex flex-col md:items-end'
                        : 'md:order-last md:pl-12 md:text-left flex flex-col md:items-start'
                      }`}>
                      <span className="text-xs font-mono font-bold text-primary mb-1 uppercase tracking-wider">Step {step.number}</span>
                      <h3 className="text-xl font-extrabold text-foreground mb-3">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Step Node Bubble */}
                    <div
                      className={`absolute left-8 md:left-1/2 -translate-x-1/2 flex size-10 items-center justify-center rounded-full font-bold text-sm transition-all duration-500 border-2 z-10 ${isActive
                          ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20'
                          : 'bg-card border-border text-muted-foreground scale-90'
                        }`}
                    >
                      {step.number}
                    </div>

                    {/* Desktop Right Side Spacer */}
                    <div className="hidden md:block w-full md:w-[45%]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 border-t border-b border-border/80 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Real exchanges, real growth
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Hear from professionals who used peer skill trades to expand their horizons.
            </p>
          </div>
        </div>

        {/* Seamless Marquee Slider Loop */}
        <div className="relative mx-auto max-w-7xl overflow-hidden py-4">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-inner {
              display: flex;
              width: max-content;
              animation: marquee 45s linear infinite;
            }
            .marquee-inner:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Left and Right Fade Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

          <div className="marquee-inner flex gap-6 px-4">
            {/* Map the testimonials twice to achieve seamless visual looping when moving to -50% */}
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={idx}
                className="w-[340px] shrink-0 rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between transition-all duration-300 hover:border-primary/20 hover:shadow-xs"
              >
                <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-accent/40 text-xs font-bold text-accent-foreground">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{t.role} • {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/30 p-12 sm:p-20 text-center shadow-xs transition-all duration-300 hover:border-primary/20">
            <style>{`
              @keyframes float-gentle {
                0%, 100% { transform: translateY(0px) rotate(var(--rot-deg, 0deg)); }
                50% { transform: translateY(-8px) rotate(var(--rot-deg, 0deg)); }
              }
              .float-badge {
                animation: float-gentle 6s ease-in-out infinite;
              }
            `}</style>

            {/* Left Side Floating Avatar Badges (Hidden on mobile) */}
            <div className="hidden lg:block">
              {/* Maya Chen */}
              <div 
                className="absolute left-[4%] top-[18%] flex size-12 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '-3deg', 'animationDelay': '0s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Priya Shah */}
              <div 
                className="absolute left-[18%] top-[10%] flex size-9 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '4deg', 'animationDelay': '1.5s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Nora Williams */}
              <div 
                className="absolute left-[10%] top-[45%] flex size-14 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '-2deg', 'animationDelay': '3s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Sam Rivera */}
              <div 
                className="absolute left-[22%] top-[68%] flex size-10 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '5deg', 'animationDelay': '4.5s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Extra Member 1 */}
              <div 
                className="absolute left-[5%] top-[72%] flex size-11 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '-1deg', 'animationDelay': '2s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
            </div>

            {/* Centered Content */}
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                Ready to trade what you know?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                Join a community of developers, designers, writers, and strategists collaborating directly to upgrade their skill sets.
              </p>
              <Link
                href="/app?mode=register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer active:scale-[0.98]"
              >
                Get Started &rarr;
              </Link>
            </div>

            {/* Right Side Floating Avatar Badges (Hidden on mobile) */}
            <div className="hidden lg:block">
              {/* Jordan Lee */}
              <div 
                className="absolute right-[4%] top-[20%] flex size-12 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '3deg', 'animationDelay': '0.7s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Alex Morgan */}
              <div 
                className="absolute right-[18%] top-[12%] flex size-9 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '-4deg', 'animationDelay': '2.2s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Sam Rivera */}
              <div 
                className="absolute right-[10%] top-[48%] flex size-14 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '2deg', 'animationDelay': '3.7s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Nora Williams */}
              <div 
                className="absolute right-[24%] top-[70%] flex size-10 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '-5deg', 'animationDelay': '5.2s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
              {/* Extra Member 2 */}
              <div 
                className="absolute right-[5%] top-[72%] flex size-11 items-center justify-center rounded-full shadow-xs border border-border/50 bg-background overflow-hidden select-none float-badge"
                style={{ '--rot-deg': '1deg', 'animationDelay': '1.2s' } as React.CSSProperties}
              >
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" alt="Member Portrait" className="object-cover w-full h-full pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Premium Dark Footer (Artistic Silhouette Transition) */}
      <section className="bg-[#090d16] relative pt-0 pb-12 overflow-hidden">
        {/* Community Silhouette Divider */}
        <div className="relative w-full h-16 overflow-hidden bg-transparent select-none pointer-events-none -translate-y-[1px]">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent h-4 z-10" />
          <svg 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 min-w-[1200px] w-full h-16 text-[#090d16] fill-current" 
            viewBox="0 0 1200 60" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Silhouette ground base */}
            <rect x="0" y="50" width="1200" height="10" />
            
            {/* Left desk setup */}
            <rect x="150" y="38" width="50" height="12" rx="1" />
            <rect x="195" y="38" width="2" height="12" />
            <circle cx="130" cy="24" r="5" />
            <path d="M 120,50 C 120,36 126,30 132,30 C 138,30 140,38 142,50" />
            <path d="M 175,38 L 182,28 L 180,28 Z" />

            {/* Chatting/Standing duo in the middle */}
            <circle cx="480" cy="18" r="5" />
            <path d="M 472,50 C 472,28 476,22 482,22 C 488,22 488,36 488,50" />
            <circle cx="510" cy="20" r="5" />
            <path d="M 502,50 C 502,30 506,24 512,24 C 518,24 518,38 518,50" />
            
            {/* Whiteboard stand */}
            <rect x="620" y="16" width="30" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M 628,36 L 624,48 M 642,36 L 646,48" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="680" cy="26" r="5" />
            <path d="M 672,50 C 672,34 676,30 682,30 C 688,30 688,40 688,50" />

            {/* Right side desk setup */}
            <rect x="920" y="38" width="60" height="12" rx="1" />
            <rect x="915" y="28" width="2" height="22" />
            <circle cx="1010" cy="24" r="5" />
            <path d="M 1000,50 C 1000,36 1006,30 1012,30 C 1018,30 1020,38 1022,50" />
            <path d="M 945,38 L 952,28 L 950,28 Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-zinc-800/80">
            {/* Mission Statement */}
            <div className="md:col-span-4 flex flex-col gap-4 text-left">
              <span className="font-extrabold text-xl tracking-tight text-white select-none">Agora</span>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                Agora is a peer-to-peer knowledge exchange. Connect directly with designers, developers, writers, and growth creators to swap skills with no fees or middleman.
              </p>
            </div>

            {/* Columns Links Grid */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 text-left">
              {/* Column 1: Explore */}
              <div className="flex flex-col gap-3.5">
                <h4 className="text-zinc-200 text-xs font-bold tracking-wider uppercase">Explore</h4>
                <nav className="flex flex-col gap-2.5 text-xs text-zinc-400">
                  <a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a>
                  <a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How It Works</a>
                  <a href="#testimonials" className="hover:text-white transition-colors cursor-pointer">Testimonials</a>
                </nav>
              </div>

              {/* Column 2: Safety & Community */}
              <div className="flex flex-col gap-3.5">
                <h4 className="text-zinc-200 text-xs font-bold tracking-wider uppercase">Safety & Rules</h4>
                <nav className="flex flex-col gap-2.5 text-xs text-zinc-400">
                  <Link href="/app" className="hover:text-white transition-colors cursor-pointer">Member Directory</Link>
                  <a href="#" className="hover:text-white transition-colors cursor-pointer">Safety Moderation</a>
                  <a href="#" className="hover:text-white transition-colors cursor-pointer">Code of Conduct</a>
                </nav>
              </div>

              {/* Column 3: Contact & Legal */}
              <div className="flex flex-col gap-3.5 col-span-2 sm:col-span-1">
                <h4 className="text-zinc-200 text-xs font-bold tracking-wider uppercase">Get In Touch</h4>
                <nav className="flex flex-col gap-2.5 text-xs text-zinc-400">
                  <a href="mailto:support@agora.exchange" className="hover:text-white transition-colors cursor-pointer font-medium">support@agora.exchange</a>
                  <div className="flex gap-3 mt-1.5">
                    {/* Twitter/X */}
                    <a href="#" className="text-zinc-400 hover:text-white transition-colors" aria-label="Twitter">
                      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    {/* GitHub */}
                    <a href="#" className="text-zinc-400 hover:text-white transition-colors" aria-label="GitHub">
                      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                    </a>
                    {/* LinkedIn */}
                    <a href="#" className="text-zinc-400 hover:text-white transition-colors" aria-label="LinkedIn">
                      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  </div>
                </nav>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} Agora Platform. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
