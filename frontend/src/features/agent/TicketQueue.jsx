import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getTicketsApi, updateTicketApi } from "../../api/ticketApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";

export default function TicketQueue() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await getTicketsApi({
        page: 1,
        limit: 50,
        scope: "queue",
      });

      const payload = res.data?.data ?? res.data;
      setTickets(payload.rows || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const claimTicket = async (ticketId) => {
    try {
      await updateTicketApi(ticketId, {
        agentId: user.id,
        status: "IN_PROGRESS",
      });
      toast.success("Ticket claimed");
      await loadQueue();
      navigate(`/agent/tickets/${ticketId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to claim ticket");
    }
  };

  if (loading) return <LoadingState label="Loading queue..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Ticket Queue</h1>
        <p className="mt-2 text-slate-400">
          Open tickets waiting for an agent to take action.
        </p>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="Queue is empty"
          description="No open tickets are waiting right now."
        />
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {ticket.ticketNumber}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">{ticket.subject}</h3>
                  <p className="mt-2 text-sm text-slate-400">{ticket.description}</p>
                  <div className="mt-3">
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>

                <button
                  onClick={() => claimTicket(ticket.id)}
                  className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 cursor-pointer"
                >
                  Claim Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}