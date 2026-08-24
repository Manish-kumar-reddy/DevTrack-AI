import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { GOAL_PERIODS } from "../../api/goals";

const EMPTY_FORM = { period: "weekly", title: "", targetTopic: "", targetCount: "", startDate: "", endDate: "" };

export default function GoalFormModal({ open, onClose, onSubmit, initial, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(
        initial
          ? {
              period: initial.period,
              title: initial.title,
              targetTopic: initial.targetTopic || "",
              targetCount: initial.targetCount,
              startDate: initial.startDate,
              endDate: initial.endDate,
            }
          : EMPTY_FORM
      );
    }
  }, [open, initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    const payload = {
      ...form,
      targetTopic: form.targetTopic || null,
      targetCount: Number(form.targetCount),
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) setErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Goal" : "New Goal"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Solve 10 DP problems" />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Period</label>
            <select className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
              {GOAL_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Target Count</label>
            <input type="number" min="1" className="input" required value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: e.target.value })} placeholder="10" />
            {errors.targetCount && <p className="mt-1 text-xs text-red-500">{errors.targetCount}</p>}
          </div>
        </div>
        <div>
          <label className="label">Target Topic (optional)</label>
          <input className="input" value={form.targetTopic} onChange={(e) => setForm({ ...form, targetTopic: e.target.value })} placeholder="Leave blank for any topic" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : initial ? "Save changes" : "Create goal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
