import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getTicketsApi } from "../../api/ticketApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";

export default function AgentTickets() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", status: "" });

  const loadTickets = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getTicketsApi({
        page,
        limit: pageInfo.limit,
        q: filters.q,
        status: filters.status,
        scope: "assigned",
      });

      const payload = res.data?.data ?? res.data;

      setTickets(payload.rows || []);
      setPageInfo({
        page: payload.page || page,
        limit: payload.limit || 10,
        totalPages: payload.totalPages || 1,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load assigned tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  useEffect(() => {
    const t = setTimeout(() => loadTickets(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  if (loading) return <LoadingState label="Loading assigned tickets..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Assigned Tickets</h1>
        <p className="mt-2 text-slate-400">
          Review tickets, reply to customers, and move work forward.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
          placeholder="Search by ticket number or subject"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 outline-none"
        />

        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
          >
            <option value="" className="bg-slate-900 text-white">All status</option>
            <option value="OPEN" className="bg-slate-900 text-white">OPEN</option>
            <option value="IN_PROGRESS" className="bg-slate-900 text-white">IN_PROGRESS</option>
            <option value="WAITING" className="bg-slate-900 text-white">WAITING</option>
            <option value="RESOLVED" className="bg-slate-900 text-white">RESOLVED</option>
            <option value="CLOSED" className="bg-slate-900 text-white">CLOSED</option>
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No assigned tickets"
          description="When tickets are assigned to you, they will appear here."
        />
      ) : (
        <>
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const unreadCount = Number(ticket.unreadMessageCount || 0);

              return (
                <button
                  key={ticket.id}
                  onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
                  className="relative w-full rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-slate-800/80"
                >
                  {unreadCount > 0 ? (
                    <span className="absolute right-4 top-4 rounded-full bg-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/20">
                      {unreadCount}
                    </span>
                  ) : null}

                  <div className="flex gap-4 cursor-pointer">
                    {ticket.attachmentUrl && (
                      <img
                        src={ticket.attachmentUrl}
                        alt="ticket"
                        className="h-20 w-20 rounded-xl border border-white/10 object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}

                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {ticket.ticketNumber}
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-white">
                        {ticket.subject}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={ticket.status} />
                      <span className="text-xs text-slate-400">
                        Priority: {ticket.priority}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <Pagination
            page={pageInfo.page}
            totalPages={pageInfo.totalPages}
            onPageChange={(nextPage) => loadTickets(nextPage)}
          />
        </>
      )}
    </div>
  );
}