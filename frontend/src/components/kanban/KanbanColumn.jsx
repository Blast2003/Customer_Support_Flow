export default function KanbanColumn({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}
