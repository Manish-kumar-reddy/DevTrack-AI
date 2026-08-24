import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as goalsApi from "../api/goals";
import GoalFormModal from "../components/goals/GoalFormModal";
import GoalCard from "../components/goals/GoalCard";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { CardSkeleton } from "../components/ui/Skeleton";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(0);
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
    goalsApi
      .listGoals()
      .then(({ data, currentStreak }) => {
        setGoals(data);
        setStreak(currentStreak);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load goals."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (editing) {
        await goalsApi.updateGoal(editing.id, payload);
        toast.success("Goal updated.");
      } else {
        await goalsApi.createGoal(payload);
        toast.success("Goal created.");
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
      await goalsApi.deleteGoal(deleteTarget.id);
      toast.success("Goal deleted.");
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Goals</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            🔥 {streak}-day current streak · {goals.length} active goal{goals.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + New Goal
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && goals.length === 0 && (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          description="Set a daily, weekly, or monthly goal to stay accountable."
          action={
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              + New Goal
            </button>
          }
        />
      )}

      {!loading && !error && goals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={(goal) => {
                setEditing(goal);
                setModalOpen(true);
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <GoalFormModal
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
        title="Delete goal?"
        description={`This will permanently delete "${deleteTarget?.title}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirming={deleting}
      />
    </div>
  );
}
