"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Search,
  Users,
  CheckCircle2,
  Menu,
  X,
  Compass,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-xs cursor-pointer"
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
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Copy Block */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground tracking-wide w-fit mb-6">
                <Sparkles className="size-3 text-muted-foreground" /> Peer-to-Peer Skill Exchange
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
                Learn new skills.<br />
                Teach what you love.<br />
                Grow your connections.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
                Agora is a peer-to-peer skill exchange platform designed to match you with learners and experts nearby or globally. Exchange knowledge, level up your career, and build lasting professional relationships.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/app?mode=register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md cursor-pointer group"
                >
                  Join the Exchange
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/app"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted/20 transition-all cursor-pointer"
                >
                  Browse Members
                </Link>
              </div>
            </div>

            {/* Illustration Mockup Block (Pure CSS, clean layout) */}
            <div className="mt-16 lg:mt-0 lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="size-2 rounded-full bg-border/80"></span>
                  <span className="size-2 rounded-full bg-border/80"></span>
                  <span className="size-2 rounded-full bg-border/80"></span>
                </div>
                
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-6">Mutual Exchange Preview</h3>

                <div className="flex flex-col gap-6 relative">
                  {/* Member 1 Card */}
                  <div className="rounded-xl border border-border bg-background p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-secondary/80 font-bold text-xs text-primary">
                        MC
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Maya Chen</h4>
                        <p className="text-[11px] text-muted-foreground">Product designer • Brooklyn, NY</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground border border-accent/30">Teaches Figma</span>
                      <span className="rounded bg-secondary/40 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">Wants Webflow</span>
                    </div>
                  </div>

                  {/* Visual Connection Line */}
                  <div className="absolute left-[30px] top-[50px] bottom-[50px] w-0.5 bg-border/80 border-dashed border-l z-0"></div>
                  
                  {/* Central Match Indicator */}
                  <div className="absolute left-[13px] top-[72px] z-10 flex h-6 w-9 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground tracking-tight shadow-xs">
                    ⚡ 95%
                  </div>

                  {/* Member 2 Card */}
                  <div className="rounded-xl border border-border bg-background p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-secondary/80 font-bold text-xs text-primary">
                        JL
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Jordan Lee</h4>
                        <p className="text-[11px] text-muted-foreground">Frontend engineer • Austin, TX</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground border border-accent/30">Teaches Webflow</span>
                      <span className="rounded bg-secondary/40 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">Wants Figma</span>
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
              Everything you need to exchange knowledge
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              No transactions, no tokens, no subscriptions. Agora is built purely on mutual collaboration and direct reciprocity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 (Col-span 2) */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="inline-flex size-10 items-center justify-center rounded-lg bg-secondary/60 text-primary mb-5">
                  <Users className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Smart Skill Matchmaking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Agora computes compatibility scores instantly by checking the skills you wish to learn against what other members want to teach. Find strong, mutual pairings in seconds without manual sorting.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex gap-6 items-center">
                <div className="flex -space-x-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold ring-2 ring-card">MC</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold ring-2 ring-card">JL</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold ring-2 ring-card">PS</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Join 3,000+ members trading skills globally</span>
              </div>
            </div>

            {/* Feature 2 (Col-span 1) */}
            <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="inline-flex size-10 items-center justify-center rounded-lg bg-secondary/60 text-primary mb-5">
                  <MessageSquare className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Direct Connection Messaging</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Send requests with personalized messages. Messaging access is guarded so your inbox stays clean until connection requests are mutually accepted.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-primary inline-flex items-center gap-1">
                Zero spam policy
              </div>
            </div>

            {/* Feature 3 (Col-span 1) */}
            <div className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="inline-flex size-10 items-center justify-center rounded-lg bg-secondary/60 text-primary mb-5">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Moderation & Account Controls</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Protect your learning environment. Manage profile visibility (public or private), block unwanted members, and instantly flag suspicious behavior.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-primary inline-flex items-center gap-1">
                Safe learning workspace
              </div>
            </div>

            {/* Feature 4 (Col-span 2) */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="inline-flex size-10 items-center justify-center rounded-lg bg-secondary/60 text-primary mb-5">
                  <Compass className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Granular Directory Filtering</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Looking for design feedback in Austin or React tutoring from London? Filter members by location, matching skills to teach, or specific skills you are looking to acquire.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex gap-4 text-xs font-medium text-muted-foreground">
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">📍 Country Filters</span>
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">🎓 Skill Tags</span>
                <span className="border border-border/60 rounded-md px-2.5 py-1 bg-background">⚡ Match Score</span>
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
              <div className="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-sm text-primary-foreground mb-6 shadow-xs">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Set up your profile</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                List the skills you have mastered and are ready to teach, along with the topics you want to learn. Set your country and optionally upload a bio.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-sm text-primary-foreground mb-6 shadow-xs">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Find your pairing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Explore profiles of other members. Send a connection request to mutual matches explaining what you'd like to share.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-sm text-primary-foreground mb-6 shadow-xs">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Start the exchange</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Once they accept, your secure chat window opens. Coordinate sessions, review work, jump on calls, and help each other succeed.
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
              Real exchanges, real growth
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Hear from professionals who used peer skill trades to expand their horizons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "I wanted to learn Webflow to turn my static layouts into live sites. I connected with Jordan who wanted design system guidance. In three weeks, I built my first portfolio and helped him clean up his design assets."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/40 text-xs font-bold text-accent-foreground">
                  MC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Maya Chen</h4>
                  <p className="text-[10px] text-muted-foreground">Product designer • Brooklyn, NY</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "Growth marketing was a mystery to me. Through Agora, I found Priya who was writing a copy guide but struggled with dashboard design. I did her layout UI, and she reviewed my SEO configuration. Amazing trade."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/40 text-xs font-bold text-accent-foreground">
                  JL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Jordan Lee</h4>
                  <p className="text-[10px] text-muted-foreground">Frontend engineer • Austin, TX</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "It is hard to find high-quality learning partnerships without sales pitches. Agora's strict connection requests policy makes it a refreshing, productive space. Just pure value sharing between creators."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/40 text-xs font-bold text-accent-foreground">
                  PS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Priya Shah</h4>
                  <p className="text-[10px] text-muted-foreground">Growth strategist • Toronto, CA</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-16 text-center shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
              Ready to trade what you know?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              Join a community of developers, designers, writers, and strategists collaborating directly to upgrade their skill sets.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/app?mode=register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md cursor-pointer"
              >
                Create Free Account
              </Link>
              <Link
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground hover:bg-muted/20 transition-all cursor-pointer"
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
