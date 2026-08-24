import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value, suffix = "" }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <span>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export default function StatCard({ label, value, suffix = "", icon, accent = "brand", subtitle }) {
  const accentClasses = {
    brand: "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
        {icon && <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${accentClasses}`}>{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white">
        <AnimatedNumber value={typeof value === "number" ? value : 0} suffix={suffix} />
        {typeof value !== "number" && value}
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </motion.div>
  );
}
