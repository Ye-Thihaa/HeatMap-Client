import { Link } from "@tanstack/react-router";
import { Thermometer } from "lucide-react";
import { motion } from "framer-motion";

export function SiteNav({ visible = true }: { visible?: boolean }) {
  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Thermometer className="h-5 w-5 text-orange-400" />
          ThermoCity
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-white/70">
          <Link to="/citizen" className="transition-colors hover:text-white">
            Cooling centers
          </Link>
          <Link to="/dashboard" className="transition-colors hover:text-white">
            Dashboard
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}