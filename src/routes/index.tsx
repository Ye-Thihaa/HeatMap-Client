import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hero3D } from "@/components/hero-3d";
import { SiteNav } from "@/components/site-nav";
import { Activity, Brain, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function LandingPage() {
  const [navVisible, setNavVisible] = useState(false);
  const heatSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heatSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavVisible(entry.isIntersecting),
      // triggers once the section's top has scrolled into the upper part of the viewport
      { threshold: 0, rootMargin: "-10% 0px -70% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <SiteNav visible={navVisible} />
      <Hero3D />

      <div ref={heatSectionRef}>
        <Section title="The urban heat island effect isn't abstract.">
          <p className="max-w-2xl text-lg text-muted-foreground">
            Dense, low-canopy blocks run 6–10°C hotter than the neighborhoods
            across the park. It's measurable, it's targetable, and the people
            living through it deserve visibility and tools — not another PDF.
          </p>
        </Section>
      </div>

      <Section title="How ThermoCity works" muted>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Step icon={<Activity />} title="Live data" body="Temperature, canopy, and density streamed per zone and refreshed continuously." index={0} />
          <Step icon={<Brain />} title="AI analysis" body="Models rank risk, prioritize gaps, and estimate the impact of specific interventions." index={1} />
          <Step icon={<Sparkles />} title="Action" body="Citizens find cool shelter and report gaps. Planners simulate before they spend." index={2} />
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <CTA
            to="/citizen"
            eyebrow="For citizens"
            title="Find the nearest cool place — right now."
            body="Live heat map, cooling-center directions, and one-tap reporting."
          />
          <CTA
            to="/dashboard"
            eyebrow="For planners"
            title="Rank risk. Model interventions. Ship them."
            body="An AI estimator tells you the °C impact before you plant a tree."
          />
        </div>
      </Section>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        ThermoCity · demo build · data mocked when API offline
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
  muted,
}: {
  title?: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={`px-6 py-24 ${muted ? "bg-surface/40" : ""}`}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-4 font-display text-3xl font-semibold sm:text-5xl"
          >
            {title}
          </motion.h2>
        )}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

function Step({ icon, title, body, index }: { icon: React.ReactNode; title: string; body: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12 }}
      className="glass rounded-2xl p-6"
    >
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">{icon}</div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </motion.div>
  );
}

function CTA({ to, eyebrow, title, body }: { to: string; eyebrow: string; title: string; body: string }) {
  return (
    <Link
      to={to as never}
      className="group glass rounded-2xl p-8 transition-transform hover:-translate-y-1"
    >
      <div className="text-xs uppercase tracking-widest text-primary">{eyebrow}</div>
      <h3 className="mt-3 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
        Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}