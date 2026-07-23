import { Link } from "@tanstack/react-router";
import { Leaf, Thermometer, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function SiteNav({ visible = true }: { visible?: boolean }) {
  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : -96, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-emerald-900/5 bg-white/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        {/* Logomark: leaf + thermometer merged — heat and nature in one glyph */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#14432C]">
            <Leaf className="h-4 w-4 text-emerald-300" strokeWidth={2.4} />
            <Thermometer className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-emerald-700" strokeWidth={2.8} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-slate-900">
            A Yate Sitt
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link to="/app" className="transition-colors hover:text-emerald-700">
            Live Map
          </Link>
          <Link to="/app/cooling-centers" className="transition-colors hover:text-emerald-700">
            Cooling centers
          </Link>
          <Link to="/app/ai" className="transition-colors hover:text-emerald-700">
            AI
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Live status pill — makes the nav feel data-driven rather than static */}
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Yangon · 34°C · High risk
          </div>

          <Link
            to="/app"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#14432C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            Get started
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}