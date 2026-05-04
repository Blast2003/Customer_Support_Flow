export default function StatusBadge({ status }) {
  const map = {
    OPEN: "bg-sky-500/15 text-sky-300 border-sky-400/20",
    IN_PROGRESS: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    WAITING: "bg-violet-500/15 text-violet-300 border-violet-400/20",
    RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
    CLOSED: "bg-slate-500/15 text-slate-300 border-slate-400/20",
    UNDER_REVIEW: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    ESCALATED: "bg-rose-500/15 text-rose-300 border-rose-400/20",
    ON_TRACK: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
    AT_RISK: "bg-amber-500/15 text-amber-300 border-amber-400/20",
    BREACHED: "bg-rose-500/15 text-rose-300 border-rose-400/20",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${map[status] || map.OPEN}`}>
      {status}
    </span>
  );
}