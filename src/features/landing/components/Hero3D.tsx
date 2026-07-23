import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Leaf, TreePine, MapPin } from "lucide-react";
import { useMemo } from "react";

function useDriftingLeaves(count: number) {
  return useMemo(() => {
    const colors = ["#10B981", "#34D399", "#65A30D"];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      size: 10 + Math.random() * 8,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 8,
      dir: Math.random() > 0.5 ? 1 : -1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);
}

function FloatingIsland() {
  const leaves = useDriftingLeaves(7);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* soft glow behind the island */}
      <div
        className="absolute inset-0 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 70%)" }}
      />

      {/* slow drifting clouds */}
      <motion.div
        className="absolute left-2 top-6 h-10 w-24 rounded-full bg-emerald-100/70 blur-xl"
        animate={{ x: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-4 top-16 h-8 w-20 rounded-full bg-emerald-100/60 blur-xl"
        animate={{ x: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* leaves drifting around the island */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {leaves.map((l) => (
          <span
            key={l.id}
            className="leaf-drift absolute top-[-20px]"
            style={{
              left: l.left,
              animationDuration: `${l.duration}s`,
              animationDelay: `${l.delay}s`,
              // @ts-expect-error custom property for keyframe direction
              "--dir": l.dir,
            }}
          >
            <Leaf size={l.size} color={l.color} fill={l.color} fillOpacity={0.2} />
          </span>
        ))}
        <style>{`
          .leaf-drift { opacity: 0; animation-name: leafDrift; animation-iteration-count: infinite; animation-timing-function: linear; }
          @keyframes leafDrift {
            0%   { opacity: 0; transform: translateY(0) translateX(0) rotate(0deg); }
            10%  { opacity: 0.8; }
            50%  { transform: translateY(180px) translateX(calc(18px * var(--dir))) rotate(calc(160deg * var(--dir))); }
            90%  { opacity: 0.5; }
            100% { opacity: 0; transform: translateY(360px) translateX(calc(-12px * var(--dir))) rotate(calc(320deg * var(--dir))); }
          }
          @media (prefers-reduced-motion: reduce) { .leaf-drift { animation: none; opacity: 0.2; } }
        `}</style>
      </div>

      {/* the island itself — gentle bob */}
      <motion.svg
        viewBox="0 0 400 400"
        className="relative drop-shadow-xl"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="islandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* water shadow beneath island */}
        <ellipse cx="200" cy="330" rx="130" ry="22" fill="url(#waterGrad)" />

        {/* island landmass */}
        <path
          d="M 90 260 Q 60 200 110 160 Q 140 110 210 100 Q 290 90 320 150 Q 350 200 310 250 Q 280 300 200 300 Q 130 300 90 260 Z"
          fill="url(#islandGrad)"
        />
        {/* darker undercarriage for depth */}
        <path
          d="M 90 260 Q 130 300 200 300 Q 280 300 310 250 Q 300 275 240 285 Q 160 295 110 270 Z"
          fill="#166534"
        />

        {/* winding path */}
        <path
          d="M 320 150 Q 260 170 230 210 Q 200 245 150 250"
          fill="none"
          stroke="#E8DCC4"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="1 14"
        />

        {/* trees (layered dots) */}
        {[
          { x: 150, y: 150, r: 22, c: "#22C55E" },
          { x: 190, y: 130, r: 16, c: "#16A34A" },
          { x: 240, y: 165, r: 20, c: "#22C55E" },
          { x: 130, y: 195, r: 14, c: "#15803D" },
          { x: 265, y: 200, r: 15, c: "#16A34A" },
        ].map((t, i) => (
          <g key={i}>
            <rect x={t.x - 2} y={t.y + t.r - 4} width="4" height="10" fill="#8A6D4B" />
            <circle cx={t.x} cy={t.y} r={t.r} fill={t.c} />
          </g>
        ))}

        {/* tiny huts */}
        <g>
          <rect x="205" y="175" width="18" height="14" rx="1.5" fill="#F5EBD8" />
          <polygon points="203,175 214,163 226,175" fill="#B45309" />
        </g>
        <g>
          <rect x="175" y="205" width="14" height="11" rx="1.5" fill="#F5EBD8" />
          <polygon points="173,205 182,196 191,205" fill="#B45309" />
        </g>

        {/* birds */}
        <path d="M 60 90 Q 66 84 72 90 Q 78 84 84 90" stroke="#15803D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 320 70 Q 326 64 332 70 Q 338 64 344 70" stroke="#15803D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </motion.svg>
    </div>
  );
}

export function Hero3D() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-16 pt-24 md:pb-20 md:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-6 md:grid-cols-2 md:gap-12">
        {/* Copy */}
        <div className="text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-widest text-emerald-600"
          >
            <Leaf size={12} /> Cooling cities, one block at a time
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-4xl font-semibold leading-[1.05] text-slate-900 sm:text-5xl md:text-6xl"
          >
            Small shade.
            <br />
            <span className="text-emerald-600">Big cool-down.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mx-auto mt-4 max-w-md text-base text-slate-500 sm:mt-6 sm:text-lg md:mx-0"
          >
            A Yate Sitt maps heat, canopy, and shade block by block —
            AI-guided planting for planners, and real cool shelter for
            citizens, right now.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-col items-center gap-4 sm:mt-8 sm:flex-row md:justify-start"
          >
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 hover:bg-emerald-700"
            >
              Try it now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
              <MapPin size={14} /> Live in Yangon
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-6 flex items-center justify-center gap-6 text-slate-400 sm:mt-10 md:justify-start"
          >
            <span className="inline-flex items-center gap-2 text-sm">
              <TreePine size={16} className="text-emerald-600" /> Canopy-first planning
            </span>
          </motion.div>
        </div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <FloatingIsland />
        </motion.div>
      </div>
    </section>
  );
}