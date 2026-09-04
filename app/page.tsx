"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Menu,
  X,
  ArrowUpRight,
  ArrowRightLeft,
  Play
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
  const [loaderVisible, setLoaderVisible] = useState(true)
  const [isEntering, setIsEntering] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  // Interactive Sandbox state (initialized to Figma & Marketing, will auto-play to React & Design Systems on load)
  const [selectedLearn, setSelectedLearn] = useState('Figma')
  const [selectedTeach, setSelectedTeach] = useState('Marketing')

  // Timeline Scroll Tracking State
  const [scrollProgress, setScrollProgress] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoModalOpen(false)
      }
    }
    if (isVideoModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVideoModalOpen])

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
        setIsEntering(true)
        setTimeout(() => setLoaderVisible(false), 900)
      }
    }
    checkSession()
  }, [router])

  useEffect(() => {
    if (checkingSession) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        }
      })
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -50px 0px'
    })

    const targets = document.querySelectorAll('.reveal-on-scroll')
    targets.forEach(t => observer.observe(t))

    return () => {
      targets.forEach(t => observer.unobserve(t))
    }
  }, [checkingSession])

  useEffect(() => {
    if (checkingSession) return

    let timer1: NodeJS.Timeout
    let timer2: NodeJS.Timeout

    const autoplayObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        autoplayObserver.disconnect() // Only run once

        // Autoplay demonstration of the simulator's interactivity after visual reveals
        timer1 = setTimeout(() => {
          setSelectedLearn('React')
        }, 2400) // Trigger after stickers are mostly shown

        timer2 = setTimeout(() => {
          setSelectedTeach('Design Systems')
        }, 3600)
      }
    }, { threshold: 0.3 })

    const card = document.getElementById('match-simulator-card')
    if (card) {
      autoplayObserver.observe(card)
    }

    return () => {
      autoplayObserver.disconnect()
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [checkingSession])

  // Use a fixed match for the simulator demo to prevent jarring layout changes during interactions
  const activeMatch = simulatorData.find(u => u.name === 'Jordan Lee') || simulatorData[0]

  const isPerfectMatch = activeMatch.teaches === selectedLearn && activeMatch.learns === selectedTeach

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans antialiased select-none overflow-x-hidden">
      {/* Curtain Loading Overlay */}
      {loaderVisible && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground transition-transform duration-800 ${
            !checkingSession ? '-translate-y-full' : 'translate-y-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="size-16 animate-spin" style={{ animationDuration: '3s' }}>
              <img src="/bg-logo2.png" alt="Agora Logo" className="size-full object-contain" />
            </div>
            <p className="text-xs text-muted-foreground tracking-wider uppercase font-bold">Loading Agora...</p>
          </div>
        </div>
      )}

      {/* Main Content with Z-Axis Depth Scale Entrance */}
      <div
        className={`min-h-screen transition-all duration-1000 ease-out origin-center ${
          checkingSession
            ? 'scale-[0.94] opacity-0 blur-xs'
            : 'scale-100 opacity-100 blur-none'
        }`}
      >
      <style>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1), transform 1000ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .reveal-on-scroll.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-150 {
          transition-delay: 150ms;
        }
        .delay-300 {
          transition-delay: 300ms;
        }
        .delay-700 {
          transition-delay: 700ms;
        }
        .delay-1200 {
          transition-delay: 1200ms;
        }
        .delay-1700 {
          transition-delay: 1700ms;
        }
      `}</style>
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-bold text-2xl tracking-tight text-primary">Agora</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              {/* <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a> */}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* <Link
              href="/app?mode=login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Log In
            </Link> */}
            <Link
              href="/app?mode=register"
              className="hidden md:inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Login/Sign Up
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
            {/* <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-border/50 pb-2 text-muted-foreground hover:text-foreground"
            >
              Testimonials
            </a> */}
            <Link
              href="/app?mode=register"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
            >
              Login/Sign Up
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center py-12 lg:py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">

            {/* Copy Block */}
            <div className="lg:col-span-6 flex flex-col justify-center reveal-on-scroll delay-150">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground tracking-wide w-fit mb-6 shadow-2xs">
                <ArrowRightLeft className="size-3 text-muted-foreground/80" /> Peer-to-Peer Skill Exchange
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-5">
                Learn a Skill.<br />
                Teach a skill.<br />
                Exchange Knowledge.
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mb-8">
                Agora connects you with people who want to learn what you know and teach what you want to learn.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Link
                  href="/app?mode=register"
                  className="inline-flex h-11 sm:min-w-[160px] items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm cursor-pointer group active:scale-[0.98]"
                >
                  Find Your Skill Match
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="inline-flex h-11 sm:min-w-[160px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98] shadow-xs group"
                >
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Play className="size-3.5 fill-current ml-0.5" />
                  </div>
                  <span>Watch Video</span>
                </button>
              </div>
            </div>

            {/* Interactive Exchange Sandbox */}
            <div className="mt-16 lg:mt-0 lg:col-span-6 flex justify-center relative" id="match-simulator-card">

              {/* Sticker 1: Define what you learn (Top Left) */}
              <div className="absolute top-10 -left-28 hidden xl:flex flex-col gap-0.5 rounded-lg border border-border/80 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs -rotate-2 select-none z-20 reveal-on-scroll delay-700">
                <span>Define what you learn</span>
                <span className="text-[10px] text-muted-foreground font-normal">Select skills you need to master</span>
              </div>
              <svg className="absolute top-16 -left-12 w-28 h-20 hidden xl:block text-muted-foreground/30 z-20 reveal-on-scroll delay-700" viewBox="0 0 110 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 15,10 C 10,30 40,65 90,50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M 80,42 L 90,50 L 80,58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              {/* Sticker 2: Offer what you teach (Right Side) */}
              <div className="absolute top-[26%] -right-20 -translate-y-1/2 hidden xl:flex flex-col gap-0.5 rounded-lg border border-border/80 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs rotate-2 select-none z-20 reveal-on-scroll delay-1200">
                <span>Offer what you teach</span>
                <span className="text-[10px] text-muted-foreground font-normal">List expertise you can share</span>
              </div>
              <svg className="absolute top-[28%] -right-6 w-24 h-24 hidden xl:block text-muted-foreground/30 z-20 reveal-on-scroll delay-1200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 80,10 C 85,35 65,70 15,60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M 25,52 L 15,60 L 23,70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              {/* Sticker 3: Match and swap! (Bottom Left) */}
              <div className="absolute top-[64%] -left-28 -translate-y-1/2 hidden xl:flex flex-col gap-0.5 rounded-lg border border-border/80 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs -rotate-2 select-none z-20 reveal-on-scroll delay-1700">
                <span>See your matches</span>
                <span className="text-[10px] text-muted-foreground font-normal">Review peer profiles and connect</span>
              </div>
              <svg className="absolute top-[66%] -left-8 w-28 h-28 hidden xl:block text-muted-foreground/30 z-20 reveal-on-scroll delay-1700" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 15,15 C 10,40 40,90 90,75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M 80,67 L 90,75 L 80,83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 z-10 relative reveal-on-scroll delay-150">
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

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 border-b border-border/40 bg-muted/5 relative overflow-hidden">
        {/* Background Aesthetic Logo Watermark */}
        <div className="absolute top-[60%] sm:top-1/2 right-0 translate-x-[45%] sm:translate-x-[20%] -translate-y-1/2 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] opacity-[0.08] pointer-events-none flex items-center justify-center">
          <img src="/bg-logo2.png" alt="" className="w-full h-full object-contain mix-blend-multiply" />
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
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

      {/* Testimonials Section (Temporarily hidden for beta) */}
      {false && (
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
      )}

      {/* Bento Grid Features Section */}
      <section id="features" className="py-20 bg-muted/20 border-t border-b border-border/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Exchange knowledge, build your network
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Discover matching peers, communicate directly in a secure workspace, and collaborate to master new skills together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1 (Col-span 2) */}
            <div className="group md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-500 ease-out hover:border-primary/40 hover:shadow-md hover:-translate-y-1 reveal-on-scroll delay-150">
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
            <div className="group rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-500 ease-out hover:border-primary/40 hover:shadow-md hover:-translate-y-1 reveal-on-scroll delay-300">
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
            <div className="group rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-500 ease-out hover:border-primary/40 hover:shadow-md hover:-translate-y-1 reveal-on-scroll delay-700">
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
            <div className="group md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5 reveal-on-scroll delay-1200">
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

      {/* CTA Box Section */}
      <section className="py-20 reveal-on-scroll">
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
                Start Exchanging Skills
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

      {/* Footer */}
      <footer className="border-t border-border bg-muted/10 pt-16 pb-12 reveal-on-scroll">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Zone */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
            {/* Left Side: Short Headline, Subheadline & Button */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Exchange knowledge. Grow together.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
                Agora connects active builders for direct, peer-to-peer skill swapping and network growth.
              </p>
              <Link
                href="/app?mode=register"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                Find Your Skill Match &rarr;
              </Link>
            </div>

            {/* Right Side: Columns with links, aligned to the right margin */}
            <div className="md:col-span-7 lg:col-span-6 lg:col-start-7 grid grid-cols-3 gap-6 md:justify-items-end">
              {/* Column 1 */}
              <div className="w-full text-left md:w-auto md:min-w-[120px]">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Explore</h4>
                <ul className="space-y-3 text-sm text-foreground/70">
                  <li><Link href="/app" className="hover:text-primary transition-colors">Browse Members</Link></li>
                  <li><Link href="/app?mode=register" className="hover:text-primary transition-colors">Match Simulator</Link></li>
                </ul>
              </div>
              {/* Column 2 */}
              <div className="w-full text-left md:w-auto md:min-w-[120px]">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Features</h4>
                <ul className="space-y-3 text-sm text-foreground/70">
                  <li><a href="#features" className="hover:text-primary transition-colors">Smart Matchmaking</a></li>
                  <li><a href="#features" className="hover:text-primary transition-colors">Secure Inbox</a></li>
                </ul>
              </div>
              {/* Column 3 */}
              <div className="w-full text-left md:w-auto md:min-w-[120px]">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Resources</h4>
                <ul className="space-y-3 text-sm text-foreground/70">
                  <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
                  {/* <li><a href="mailto:support@agora.exchange" className="hover:text-primary transition-colors">Help & Support</a></li> */}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Zone */}
          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-foreground/70">
            <div className="flex items-center gap-2">
              <div className="size-7 flex items-center justify-center shrink-0">
                <img src="/bg-logo2.png" alt="Agora Logo" className="size-full object-contain" />
              </div>
              <span>&copy; 2026 Agora Platform. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              {/* <a href="mailto:support@agora.exchange" className="hover:text-primary transition-colors">Feedback & Support</a> */}
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal / Lightbox */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-card border border-border/80 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/95">
              <span className="text-sm font-bold text-foreground">Agora Platform Tour</span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Video Player */}
            <div className="relative bg-black flex items-center justify-center overflow-hidden">
              <video
                src="/tour-video.mp4"
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
