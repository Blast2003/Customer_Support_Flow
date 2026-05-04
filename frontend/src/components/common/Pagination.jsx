export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
      <button
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page <= 1}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <p className="text-sm text-slate-300">
        Page <span className="font-semibold text-white">{page}</span> of{" "}
        <span className="font-semibold text-white">{totalPages}</span>
      </p>

      <button
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page >= totalPages}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}