import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Skeleton from "../ui/Skeleton";
import { getProblemNote, upsertProblemNote } from "../../api/problems";

export default function ProblemNotesModal({ open, onClose, problem }) {
  const [form, setForm] = useState({ notes: "", mistakes: "", timeComplexity: "", spaceComplexity: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("edit");

  useEffect(() => {
    if (open && problem) {
      setLoading(true);
      setTab("edit");
      getProblemNote(problem.id)
        .then(({ data }) =>
          setForm({
            notes: data.notes || "",
            mistakes: data.mistakes || "",
            timeComplexity: data.timeComplexity || "",
            spaceComplexity: data.spaceComplexity || "",
          })
        )
        .finally(() => setLoading(false));
    }
  }, [open, problem]);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertProblemNote(problem.id, form);
      toast.success("Notes saved.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save notes.");
    } finally {
      setSaving(false);
    }
  }

  if (!problem) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Notes — ${problem.title}`} wide>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Time Complexity</label>
              <input
                className="input"
                value={form.timeComplexity}
                onChange={(e) => setForm({ ...form, timeComplexity: e.target.value })}
                placeholder="O(n)"
              />
            </div>
            <div>
              <label className="label">Space Complexity</label>
              <input
                className="input"
                value={form.spaceComplexity}
                onChange={(e) => setForm({ ...form, spaceComplexity: e.target.value })}
                placeholder="O(1)"
              />
            </div>
          </div>

          <div>
            <label className="label">Mistakes</label>
            <textarea
              className="input min-h-[70px] resize-y"
              value={form.mistakes}
              onChange={(e) => setForm({ ...form, mistakes: e.target.value })}
              placeholder="What went wrong the first time..."
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label !mb-0">Notes (Markdown)</label>
              <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  className={`rounded-md px-2.5 py-1 ${tab === "edit" ? "bg-white dark:bg-white/20 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}
                  onClick={() => setTab("edit")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`rounded-md px-2.5 py-1 ${tab === "preview" ? "bg-white dark:bg-white/20 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}
                  onClick={() => setTab("preview")}
                >
                  Preview
                </button>
              </div>
            </div>
            {tab === "edit" ? (
              <textarea
                className="input min-h-[160px] resize-y font-mono text-xs"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={"## Approach\nUse a hashmap to store seen values..."}
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none min-h-[160px] rounded-xl border border-slate-200 dark:border-white/10 p-3.5 overflow-y-auto">
                {form.notes ? (
                  <ReactMarkdown>{form.notes}</ReactMarkdown>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
