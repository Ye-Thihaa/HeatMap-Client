import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hero3D } from "../components/Hero3D";
import { SiteNav } from "../components/SiteNav";
import { Activity, Brain, Sparkles, ArrowRight, Leaf } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function LandingPage() {
  const [navVisible, setNavVisible] = useState(false);
  const heatSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heatSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "-10% 0px -70% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white text-slate-900">
      <SiteNav visible={navVisible} />

      <Hero3D />

      <div ref={heatSectionRef}>
        <Section title="The urban heat island effect isn't abstract.">
          <p className="max-w-2xl text-lg text-slate-500">
            Dense, low-canopy blocks run 6–10°C hotter than the leafy
            neighborhoods across the park. More trees, smarter shade, and
            real data can close that gap — this is a solvable problem, not
            just another PDF.
          </p>
        </Section>
      </div>

      <Section title="How A Yate Sitt works" muted>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Step icon={<Activity />} title="Live data" body="Temperature, tree canopy, and density streamed per zone and refreshed continuously." index={0} />
          <Step icon={<Brain />} title="AI analysis" body="Models rank risk, prioritize planting sites, and estimate the cooling impact of each intervention." index={1} />
          <Step icon={<Sparkles />} title="Action" body="Citizens find cool, shaded shelter and report gaps. Planners simulate canopy growth before they spend." index={2} />
        </div>
      </Section>

      {/* Dark credibility stripe — the "trusted mark" moment */}
      <section className="relative overflow-hidden bg-[#0F2A1D] px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 30% 20%, rgba(16,185,129,0.25), transparent 55%)" }}
        />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-emerald-300">
            Grounded in real data
          </span>
          <h3 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            A trusted signal for cooler, greener cities
          </h3>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Stat value="6–10°C" label="hotter in low-canopy blocks" />
            <Stat value="35%" label="less shade than city average" />
            <Stat value="Live" label="AI-updated risk & canopy data" />
          </div>
        </div>
      </section>

      <Section>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-100 bg-emerald-50/60 px-6 py-10 text-center">
          <Leaf className="text-emerald-600" size={28} />
          <h3 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
            Every tree planted is a small cooling system.
          </h3>
          <p className="max-w-xl text-sm text-slate-500 sm:text-base">
            A mature tree canopy can drop street-level temperatures by
            several degrees. A Yate Sitt helps planners find exactly where
            that shade is missing — and helps citizens find it when they
            need it most.
          </p>
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <CTA
            to="/app"
            eyebrow="For citizens"
            title="Find the nearest cool, shaded place — right now."
            body="Live heat map, cooling-center directions, and one-tap reporting for treeless streets."
          />
          <CTA
            to="/dashboard"
            eyebrow="For planners"
            title="Rank risk. Model canopy interventions. Ship them."
            body="An AI estimator tells you the °C impact of every tree before you plant it."
          />
        </div>
      </Section>

      <footer className="border-t border-slate-200 py-10 text-center text-xs text-slate-400">
        A Yate Sitt · demo build · data mocked when API offline
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold text-emerald-300 sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-emerald-100/60">{label}</div>
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
    <section className={`px-6 py-24 ${muted ? "bg-emerald-50/50" : ""}`}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-4 font-display text-3xl font-semibold text-emerald-600 sm:text-5xl"
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
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-600">{icon}</div>
      <h3 className="font-display text-xl font-semibold text-emerald-600">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </motion.div>
  );
}

function CTA({ to, eyebrow, title, body }: { to: string; eyebrow: string; title: string; body: string }) {
  return (
    <Link
      to={to as never}
      className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-transform hover:-translate-y-1 hover:border-emerald-300"
    >
      <div className="text-xs uppercase tracking-widest text-emerald-600">{eyebrow}</div>
      <h3 className="mt-3 font-display text-2xl font-semibold text-emerald-600">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
        Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}