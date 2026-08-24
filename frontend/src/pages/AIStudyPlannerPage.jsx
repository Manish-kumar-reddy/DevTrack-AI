import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as aiApi from "../api/ai";

export default function AIStudyPlannerPage() {
  const [form, setForm] = useState({ weakTopic: "", targetCompany: "", daysRemaining: "30" });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await aiApi.generateStudyPlan({
        weakTopic: form.weakTopic,
        targetCompany: form.targetCompany || undefined,
        daysRemaining: Number(form.daysRemaining),
      });
      setPlan(data);
      setExpandedPhase(0);
      toast.success("Your personalized roadmap is ready!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">✨ AI Study Assistant</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Get a personalized DSA roadmap based on your weak topic, target company, and timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card lg:col-span-1 h-fit space-y-4">
          <div>
            <label className="label">Weak Topic</label>
            <input
              className="input"
              required
              value={form.weakTopic}
              onChange={(e) => setForm({ ...form, weakTopic: e.target.value })}
              placeholder="e.g. Dynamic Programming"
            />
          </div>
          <div>
            <label className="label">Target Company</label>
            <input
              className="input"
              value={form.targetCompany}
              onChange={(e) => setForm({ ...form, targetCompany: e.target.value })}
              placeholder="e.g. Google (optional)"
            />
          </div>
          <div>
            <label className="label">Days Remaining</label>
            <input
              type="number"
              min="1"
              max="365"
              className="input"
              required
              value={form.daysRemaining}
              onChange={(e) => setForm({ ...form, daysRemaining: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Generating..." : "Generate Roadmap"}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {!plan && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 text-4xl">🧭</div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">No roadmap yet</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Fill in the form to generate a personalized, rule-based study plan.
                </p>
              </motion.div>
            )}

            {plan && (
              <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="card">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{plan.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plan.recommendedTopics.slice(0, 6).map((t) => (
                      <span key={t} className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                    Total target: {plan.totalProblemsTarget} problems over {plan.daysRemaining} days
                  </p>
                </div>

                <div className="card">
                  <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Roadmap</h2>
                  <div className="space-y-2">
                    {plan.roadmap.map((phase, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <button
                          className="flex w-full items-center justify-between bg-slate-50 dark:bg-white/5 px-4 py-3 text-left"
                          onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{phase.phase}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{phase.days} days</p>
                          </div>
                          <span className="text-slate-400">{expandedPhase === i ? "−" : "+"}</span>
                        </button>
                        <AnimatePresence>
                          {expandedPhase === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 py-3 space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {phase.topics.map((t) => (
                                    <span key={t} className="badge bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Difficulty mix: {phase.difficultyMix.easy}% Easy / {phase.difficultyMix.medium}% Medium /{" "}
                                  {phase.difficultyMix.hard}% Hard
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Daily Schedule</h2>
                  <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {plan.dailySchedule.map((d) => (
                      <div key={d.day} className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                          {d.day}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{d.topic}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{d.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
