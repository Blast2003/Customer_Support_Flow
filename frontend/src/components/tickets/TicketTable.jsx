import TicketCard from "./TicketCard.jsx";

export default function TicketTable({ tickets }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
    </div>
  );
}
