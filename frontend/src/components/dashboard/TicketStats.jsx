export default function TicketStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-slate-500">{key}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  );
}
