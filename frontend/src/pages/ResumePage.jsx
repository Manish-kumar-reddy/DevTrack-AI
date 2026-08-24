import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import * as resumeApi from "../api/resume";
import { useAuth } from "../context/AuthContext";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";

export default function ResumePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  function load() {
    setLoading(true);
    setError(null);
    resumeApi
      .getResumeSummary()
      .then(({ data }) => setSummary(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load resume summary."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleDownloadPdf() {
    if (!summary) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(user?.name || "Developer", margin, y);
    y += 26;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.text(user?.targetCompany ? `Aspiring for ${user.targetCompany}` : "Competitive Programming & DSA Summary", margin, y);
    y += 30;

    doc.setDrawColor(220);
    doc.line(margin, y, 548, y);
    y += 24;

    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Summary", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(summary.generatedText, 500);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 15 + 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Problem Solving Stats", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total Problems Solved: ${summary.totalSolved}`, margin, y);
    y += 16;
    doc.text(
      `Difficulty: Easy ${summary.difficultyBreakdown.Easy} · Medium ${summary.difficultyBreakdown.Medium} · Hard ${summary.difficultyBreakdown.Hard}`,
      margin,
      y
    );
    y += 24;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("By Platform", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    summary.byPlatform.forEach((p) => {
      doc.text(`${p.platform}: ${p.count} problems`, margin, y);
      y += 15;
    });
    y += 10;

    if (summary.strongestTopics.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Strongest Topics", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(summary.strongestTopics.join(", "), margin, y);
      y += 24;
    }

    if (summary.contestsCount > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Contest Highlights", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`${summary.contestsCount} contests participated`, margin, y);
      y += 15;
      Object.entries(summary.bestRatingByPlatform).forEach(([platform, rating]) => {
        doc.text(`Best ${platform} rating: ${rating}`, margin, y);
        y += 15;
      });
    }

    doc.save(`${(user?.name || "devtrack").replace(/\s+/g, "_")}_resume_summary.pdf`);
    toast.success("PDF downloaded.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📄 Resume Mode</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            An auto-generated portfolio summary from your tracked progress.
          </p>
        </div>
        <button className="btn-primary" onClick={handleDownloadPdf} disabled={!summary || summary.totalSolved === 0}>
          ⬇ Download PDF
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && (
        <div className="card space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {!loading && !error && summary && (
        <div ref={printRef} className="card space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user?.targetCompany ? `Aspiring for ${user.targetCompany}` : "Competitive Programming & DSA Summary"}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 p-4">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{summary.generatedText}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Total Solved" value={summary.totalSolved} />
            <Stat label="Easy" value={summary.difficultyBreakdown.Easy} />
            <Stat label="Medium" value={summary.difficultyBreakdown.Medium} />
            <Stat label="Hard" value={summary.difficultyBreakdown.Hard} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">By Platform</h3>
            <div className="flex flex-wrap gap-2">
              {summary.byPlatform.map((p) => (
                <span key={p.platform} className="badge bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {p.platform}: {p.count}
                </span>
              ))}
            </div>
          </div>

          {summary.strongestTopics.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Strongest Topics</h3>
              <div className="flex flex-wrap gap-2">
                {summary.strongestTopics.map((t) => (
                  <span key={t} className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {summary.contestsCount > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Contest Highlights</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{summary.contestsCount} contests participated</p>
              {Object.entries(summary.bestRatingByPlatform).map(([platform, rating]) => (
                <p key={platform} className="text-sm text-slate-600 dark:text-slate-300">
                  Best {platform} rating: {rating}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 text-center">
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
