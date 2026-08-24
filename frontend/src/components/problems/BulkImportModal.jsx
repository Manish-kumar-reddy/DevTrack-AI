import { useState } from "react";
import Modal from "../ui/Modal";
import { bulkImportProblems } from "../../api/problems";

export default function BulkImportModal({ open, onClose, onImported }) {
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleClose() {
    setText("");
    setResult(null);
    setError(null);
    onClose();
  }

  async function handleImport() {
    const urls = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (urls.length === 0) return;

    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await bulkImportProblems(urls);
      setResult(data);
      if (data.imported > 0) onImported();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Import Problems" wide>
      <div className="space-y-4">
        <div>
          <label className="label">Paste one problem URL per line (LeetCode or GeeksforGeeks, up to 50)</label>
          <textarea
            className="input min-h-[160px] resize-y font-mono text-xs"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              "https://leetcode.com/problems/two-sum/\n" +
              "https://leetcode.com/problems/merge-intervals/\n" +
              "https://www.geeksforgeeks.org/problems/rotten-oranges2536/1"
            }
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {result && (
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 space-y-2">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Imported: {result.imported} &nbsp;·&nbsp; Skipped: {result.skipped}
            </p>
            {result.skippedDetails.length > 0 && (
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-slate-500 dark:text-slate-400">
                {result.skippedDetails.map((s, i) => (
                  <li key={i} className="truncate">
                    {s.url} — {s.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={handleImport} disabled={importing || !text.trim()}>
            {importing ? "Importing..." : "Import All"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
