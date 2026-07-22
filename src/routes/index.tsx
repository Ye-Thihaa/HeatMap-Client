import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useScroll } from 'framer-motion'

const Hero3D = lazy(() => import('@/components/landing/Hero3D').then((m) => ({ default: m.Hero3D })))

const STEPS = [
  {
    title: 'Live data',
    body: 'Satellite temperature readings, green cover, and population density feed in continuously by zone.'
  },
  {
    title: 'AI analysis',
    body: 'Every zone is scored for heat risk, and every proposed intervention is estimated for cooling impact.'
  },
  {
    title: 'Action',
    body: 'Planners see exactly where to act first, and citizens see exactly where to cool off.'
  }
]

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useRef(0)
  const [showCanvas, setShowCanvas] = useState(false)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      scrollProgress.current = v
    })
    return unsubscribe
  }, [scrollYProgress])

  // Only mount the WebGL canvas once the hero is actually visible, and stop
  // paying its cost once the user has scrolled well past it.
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setShowCanvas(entry.isIntersecting), {
      threshold: 0.05
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-ink-950 text-mist-100">
      <section ref={heroRef} className="relative h-[160vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            {showCanvas && (
              <Suspense fallback={null}>
                <Hero3D scrollProgress={scrollProgress} />
              </Suspense>
            )}
          </div>
          <div className="pointer-events-none relative z-10 px-6 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-ink-600">
              AI Urban Heat Intelligence
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              Your city is heating up.
              <br />
              <span className="heat-gradient-text">See where, and what to do about it.</span>
            </h1>
          </div>
          <div className="pointer-events-auto relative z-10 mt-8 flex gap-3">
            <Link
              to="/app"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
            >
              View live map
            </Link>
            <Link
              to="/dashboard"
              className="rounded-full border border-mist-100/30 px-6 py-3 text-sm font-semibold text-mist-100 transition-colors hover:bg-mist-100/10"
            >
              Enter dashboard
            </Link>
          </div>
          <p className="pointer-events-none absolute bottom-8 text-xs text-ink-600">
            Scroll — watch it heat up
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <FadeIn>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            The urban heat island effect
          </h2>
          <p className="mt-4 text-ink-600">
            Concrete and asphalt absorb and re-radiate heat, so dense city zones can run several
            degrees hotter than surrounding areas — and it's the zones with the least green cover
            and the highest population density that feel it most.
          </p>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <FadeIn>
          <h2 className="mb-10 text-center font-display text-2xl font-semibold sm:text-3xl">
            How it works
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-ink-800 bg-ink-900 p-6">
                <span className="font-mono text-xs text-ink-600">Step {i + 1}</span>
                <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{step.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-800 px-6 py-20 text-center">
        <FadeIn>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Ready to see your city's heat map?
          </h2>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/app"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
            >
              View live map
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}

function FadeIn({
  children,
  delay = 0
}: {
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
