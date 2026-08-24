import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { CONTEST_PLATFORMS } from "../../api/contests";

const EMPTY_FORM = { name: "", platform: "LeetCode", contestDate: "", rating: "", rank: "", problemsSolved: "" };

export default function ContestFormModal({ open, onClose, onSubmit, initial, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(
        initial
          ? {
              name: initial.name,
              platform: initial.platform,
              contestDate: initial.contestDate,
              rating: initial.rating ?? "",
              rank: initial.rank ?? "",
              problemsSolved: initial.problemsSolved ?? "",
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
      rating: form.rating === "" ? null : Number(form.rating),
      rank: form.rank === "" ? null : Number(form.rank),
      problemsSolved: form.problemsSolved === "" ? 0 : Number(form.problemsSolved),
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) setErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Contest" : "Log Contest"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Contest Name</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Weekly Contest 400" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Platform</label>
            <select className="input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {CONTEST_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" required value={form.contestDate} onChange={(e) => setForm({ ...form, contestDate: e.target.value })} />
            {errors.contestDate && <p className="mt-1 text-xs text-red-500">{errors.contestDate}</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Rating</label>
            <input type="number" className="input" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="1500" />
          </div>
          <div>
            <label className="label">Rank</label>
            <input type="number" min="1" className="input" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} placeholder="2300" />
          </div>
          <div>
            <label className="label">Problems Solved</label>
            <input type="number" min="0" className="input" value={form.problemsSolved} onChange={(e) => setForm({ ...form, problemsSolved: e.target.value })} placeholder="3" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : initial ? "Save changes" : "Add contest"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
