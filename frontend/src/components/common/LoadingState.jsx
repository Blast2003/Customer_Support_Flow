export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
      {label}
    </div>
  );
}