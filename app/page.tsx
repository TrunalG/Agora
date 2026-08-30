"use client"

import { useEffect, useState } from 'react'
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
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <div className="mt-12 lg:mt-0 lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
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
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                            selectedLearn === skill
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
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                            selectedTeach === skill
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-tight uppercase border transition-all duration-300 ${
                        isPerfectMatch
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
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              How Agora works in three steps
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We focus on reciprocal learning. Here is how you start exchanging knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-light text-primary/30 font-mono mb-4">01.</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Set up your profile</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Create your card. Define exactly what you are building, the tools you teach, and what you need next.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-light text-primary/30 font-mono mb-4">02.</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Find your pairing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Match with peers. Discover matching profiles based on reciprocated teaches/learns scores.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-light text-primary/30 font-mono mb-4">03.</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Start the exchange</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Swap knowledge. Connect in our secure inbox to talk, share guidance, and collaborate on your growth goals.
              </p>
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
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-16 text-center shadow-lg max-w-4xl mx-auto transition-all hover:border-primary/20">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Ready to trade what you know?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              Join a community of developers, designers, writers, and strategists collaborating directly to upgrade their skill sets.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/app?mode=register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md cursor-pointer active:scale-[0.98]"
              >
                Create Free Account
              </Link>
              <Link
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground hover:bg-muted/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                Browse the Community
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
