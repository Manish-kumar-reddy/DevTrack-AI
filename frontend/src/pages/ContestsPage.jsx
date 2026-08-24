import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as contestsApi from "../api/contests";
import ContestFormModal from "../components/contests/ContestFormModal";
import RatingChart from "../components/contests/RatingChart";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Pagination from "../components/ui/Pagination";
import { TableRowSkeleton } from "../components/ui/Skeleton";

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([contestsApi.listContests({ page, limit: 10 }), contestsApi.getRatingHistory()])
      .then(([list, history]) => {
        setContests(list.data);
        setPagination(list.pagination);
        setRatingHistory(history.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load contests."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (editing) {
        await contestsApi.updateContest(editing.id, payload);
        toast.success("Contest updated.");
      } else {
        await contestsApi.createContest(payload);
        toast.success("Contest logged.");
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await contestsApi.deleteContest(deleteTarget.id);
      toast.success("Contest deleted.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contest Tracker</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pagination.total} contests logged</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + Log Contest
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          <div className="card">
            <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Rating Progression</h2>
            <RatingChart data={ratingHistory} />
          </div>

          <div className="card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 dark:border-white/10 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Contest</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Solved</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading && Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}
                {!loading &&
                  contests.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.platform}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.contestDate}</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-100">{c.rating ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.rank ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.problemsSolved}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn-ghost px-2.5 py-1 text-xs"
                            onClick={() => {
                              setEditing(c);
                              setModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button className="btn-danger px-2.5 py-1 text-xs" onClick={() => setDeleteTarget(c)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!loading && contests.length === 0 && (
              <EmptyState
                icon="🏆"
                title="No contests logged yet"
                description="Log your first contest to start tracking your rating over time."
                action={
                  <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    + Log Contest
                  </button>
                }
              />
            )}

            {!loading && contests.length > 0 && (
              <div className="px-4 pb-4">
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
              </div>
            )}
          </div>
        </>
      )}

      <ContestFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        initial={editing}
        saving={saving}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete contest?"
        description={`This will permanently delete "${deleteTarget?.name}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirming={deleting}
      />
    </div>
  );
}
