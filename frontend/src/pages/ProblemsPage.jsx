import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as problemsApi from "../api/problems";
import { PLATFORMS, DIFFICULTIES, STATUSES } from "../api/problems";
import ProblemFormModal from "../components/problems/ProblemFormModal";
import BulkImportModal from "../components/problems/BulkImportModal";
import ProblemNotesModal from "../components/problems/ProblemNotesModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import { TableRowSkeleton } from "../components/ui/Skeleton";
import useDebounce from "../hooks/useDebounce";

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [filters, setFilters] = useState({ platform: "", difficulty: "", status: "", favorite: "" });
  const [sort, setSort] = useState({ sortBy: "createdAt", sortOrder: "DESC" });
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [notesTarget, setNotesTarget] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    const params = {
      page,
      limit: 10,
      ...sort,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.platform && { platform: filters.platform }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
      ...(filters.status && { status: filters.status }),
      ...(filters.favorite && { favorite: true }),
    };
    problemsApi
      .listProblems(params)
      .then(({ data, pagination: p }) => {
        setProblems(data);
        setPagination(p);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load problems."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, sort, debouncedSearch, filters]);
  useEffect(() => setPage(1), [debouncedSearch, filters]);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (editing) {
        await problemsApi.updateProblem(editing.id, payload);
        toast.success("Problem updated.");
      } else {
        await problemsApi.createProblem(payload);
        toast.success("Problem added.");
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
      await problemsApi.deleteProblem(deleteTarget.id);
      toast.success("Problem deleted.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleFavorite(problem) {
    try {
      const { data } = await problemsApi.toggleFavorite(problem.id);
      setProblems((prev) => prev.map((p) => (p.id === problem.id ? { ...p, isFavorite: data.isFavorite } : p)));
    } catch {
      toast.error("Failed to update favorite.");
    }
  }

  function toggleSort(field) {
    setSort((prev) =>
      prev.sortBy === field
        ? { sortBy: field, sortOrder: prev.sortOrder === "ASC" ? "DESC" : "ASC" }
        : { sortBy: field, sortOrder: "ASC" }
    );
  }

  const hasActiveFilters = search || filters.platform || filters.difficulty || filters.status || filters.favorite;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Problem Tracker</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pagination.total} problems tracked</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setBulkImportOpen(true)}>
            ⬆ Bulk Import
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            + Add Problem
          </button>
        </div>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search title or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input w-auto"
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
        >
          <option value="">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          className={`btn-secondary ${filters.favorite ? "!bg-amber-100 !text-amber-700 dark:!bg-amber-500/15 dark:!text-amber-400" : ""}`}
          onClick={() => setFilters({ ...filters, favorite: filters.favorite ? "" : true })}
        >
          ⭐ Favorites
        </button>
        {hasActiveFilters && (
          <button
            className="btn-ghost text-xs"
            onClick={() => {
              setSearch("");
              setFilters({ platform: "", difficulty: "", status: "", favorite: "" });
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 dark:border-white/10 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <SortableHeader label="Title" field="title" sort={sort} onClick={toggleSort} />
                <th className="px-4 py-3">Platform</th>
                <SortableHeader label="Difficulty" field="difficulty" sort={sort} onClick={toggleSort} />
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Status</th>
                <SortableHeader label="Solved Date" field="solvedDate" sort={sort} onClick={toggleSort} />
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={8} />)}

              {!loading &&
                problems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleFavorite(p)} aria-label="Toggle favorite" className="text-lg">
                        {p.isFavorite ? "⭐" : "☆"}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{p.title}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.platform}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.difficulty}>{p.difficulty}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.topic}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.status}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.solvedDate || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {p.status === "Solved" && (
                          <button className="btn-ghost px-2.5 py-1 text-xs" onClick={() => setNotesTarget(p)}>
                            Notes
                          </button>
                        )}
                        <button
                          className="btn-ghost px-2.5 py-1 text-xs"
                          onClick={() => {
                            setEditing(p);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button className="btn-danger px-2.5 py-1 text-xs" onClick={() => setDeleteTarget(p)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && problems.length === 0 && (
            <EmptyState
              icon="📭"
              title="No problems found"
              description={hasActiveFilters ? "Try adjusting your filters." : "Add your first problem to start tracking."}
              action={
                !hasActiveFilters && (
                  <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    + Add Problem
                  </button>
                )
              }
            />
          )}

          {!loading && problems.length > 0 && (
            <div className="px-4 pb-4">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      )}

      <ProblemFormModal
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
        title="Delete problem?"
        description={`This will permanently delete "${deleteTarget?.title}". This can't be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirming={deleting}
      />

      <BulkImportModal open={bulkImportOpen} onClose={() => setBulkImportOpen(false)} onImported={load} />

      <ProblemNotesModal open={Boolean(notesTarget)} onClose={() => setNotesTarget(null)} problem={notesTarget} />
    </div>
  );
}

function SortableHeader({ label, field, sort, onClick }) {
  const active = sort.sortBy === field;
  return (
    <th
      className={`cursor-pointer select-none px-4 py-3 hover:text-slate-700 dark:hover:text-slate-200 ${active ? "text-brand-600 dark:text-brand-400" : ""}`}
      onClick={() => onClick(field)}
    >
      {label} {active && (sort.sortOrder === "ASC" ? "↑" : "↓")}
    </th>
  );
}
