import { motion } from "framer-motion";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-12 text-white lg:flex">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur font-bold">D</div>
          <span className="text-xl font-bold">DevTrack AI</span>
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-3xl font-bold leading-tight">Track, analyze, and accelerate your interview prep.</h2>
          <p className="text-brand-100/90">
            Problem tracking, contest history, AI-generated roadmaps, and beautiful analytics — all in one place.
          </p>
        </div>
        <p className="relative z-10 text-sm text-brand-100/70">© {new Date().getFullYear()} DevTrack AI</p>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>}
        </motion.div>
      </div>
    </div>
  );
}
