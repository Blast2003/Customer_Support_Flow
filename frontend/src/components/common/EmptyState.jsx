export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}