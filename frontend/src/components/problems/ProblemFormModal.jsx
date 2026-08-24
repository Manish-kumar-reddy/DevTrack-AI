import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { PLATFORMS, DIFFICULTIES, STATUSES, fetchProblemFromUrl } from "../../api/problems";

const EMPTY_FORM = {
  title: "",
  platform: "LeetCode",
  difficulty: "Easy",
  topic: "",
  status: "Todo",
  notes: "",
  solvedDate: "",
  timeSpentMinutes: "",
  sourceUrl: "",
  sourceSlug: "",
};

export default function ProblemFormModal({ open, onClose, onSubmit, initial, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Quick Add from URL -- only offered when creating a new problem, since
  // editing an existing entry already has real data to work from.
  const [urlInput, setUrlInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [fetchNotice, setFetchNotice] = useState(null);

  useEffect(() => {
    if (open) {
      setErrors({});
      setUrlInput("");
      setFetchError(null);
      setFetchNotice(null);
      setForm(
        initial
          ? {
              title: initial.title,
              platform: initial.platform,
              difficulty: initial.difficulty,
              topic: initial.topic,
              status: initial.status,
              notes: initial.notes || "",
              solvedDate: initial.solvedDate || "",
              timeSpentMinutes: initial.timeSpentMinutes ?? "",
              sourceUrl: initial.sourceUrl || "",
              sourceSlug: initial.sourceSlug || "",
            }
          : EMPTY_FORM
      );
    }
  }, [open, initial]);

  async function handleFetchDetails() {
    if (!urlInput.trim()) return;
    setFetching(true);
    setFetchError(null);
    setFetchNotice(null);
    try {
      const details = await fetchProblemFromUrl(urlInput.trim());
      setForm((prev) => ({
        ...prev,
        title: details.title ?? prev.title,
        platform: details.platform ?? prev.platform,
        difficulty: details.difficulty ?? prev.difficulty,
        topic: details.topic ?? prev.topic,
        sourceUrl: urlInput.trim(),
        sourceSlug: details.sourceSlug ?? "",
      }));
      if (details.partial) {
        setFetchNotice(details.partialReason || "Only some details could be auto-filled -- please review.");
      }
    } catch (err) {
      setFetchError(err.response?.data?.message || "Could not fetch problem details. Please enter them manually.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    const payload = {
      ...form,
      solvedDate: form.solvedDate || null,
      timeSpentMinutes: form.timeSpentMinutes === "" ? null : Number(form.timeSpentMinutes),
      sourceUrl: form.sourceUrl || null,
      sourceSlug: form.sourceSlug || null,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) setErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Problem" : "Add Problem"} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!initial && (
          <div className="rounded-xl border border-dashed border-brand-300 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5 p-3.5 space-y-2">
            <label className="label !mb-1">Paste Problem URL</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://leetcode.com/problems/... OR https://geeksforgeeks.org/problems/..."
              />
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={handleFetchDetails}
                disabled={fetching || !urlInput.trim()}
              >
                {fetching ? "Fetching..." : "Fetch Details"}
              </button>
            </div>
            {fetchError && <p className="text-xs text-red-500">{fetchError}</p>}
            {fetchNotice && <p className="text-xs text-amber-600 dark:text-amber-400">⚠️ {fetchNotice}</p>}
          </div>
        )}

        <div>
          <label className="label">Title</label>
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Two Sum"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Platform</label>
            <select className="input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Topic</label>
            <input
              className="input"
              required
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="Arrays"
            />
            {errors.topic && <p className="mt-1 text-xs text-red-500">{errors.topic}</p>}
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Solved Date</label>
            <input
              type="date"
              className="input"
              value={form.solvedDate}
              onChange={(e) => setForm({ ...form, solvedDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Time Spent (minutes)</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.timeSpentMinutes}
              onChange={(e) => setForm({ ...form, timeSpentMinutes: e.target.value })}
              placeholder="30"
            />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[80px] resize-y"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Approach, gotchas, follow-ups..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : initial ? "Save changes" : "Add problem"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
