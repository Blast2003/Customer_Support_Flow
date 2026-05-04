export default function TicketCard({ ticket }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{ticket.ticketNumber}</div>
      <div className="font-semibold">{ticket.subject}</div>
      <div className="text-sm mt-2">{ticket.status}</div>
    </div>
  );
}
