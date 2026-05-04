import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getTicketsApi, updateTicketApi } from "../../api/ticketApi";
import { getAgentsApi } from "../../api/userApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";

export default function AdminTickets() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", status: "" });

  const [drafts, setDrafts] = useState({});

  const buildTicketDrafts = (ticketList) => {
    const nextDrafts = {};
    ticketList.forEach((ticket) => {
      nextDrafts[ticket.id] = {
        agentId: ticket.agentId ?? "",
        status: ticket.status ?? "OPEN",
      };
    });
    setDrafts(nextDrafts);
  };

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const [ticketsRes, agentsRes] = await Promise.all([
        getTicketsApi({
          page,
          limit: pageInfo.limit,
          q: filters.q,
          status: filters.status,
        }),
        getAgentsApi(),
      ]);

      const ticketPayload = ticketsRes.data?.data ?? ticketsRes.data;
      const agentPayload = agentsRes.data?.data ?? agentsRes.data;

      const rows = ticketPayload.rows || [];
      setTickets(rows);
      setAgents(agentPayload || []);
      buildTicketDrafts(rows);

      setPageInfo({
        page: ticketPayload.page || page,
        limit: ticketPayload.limit || 10,
        totalPages: ticketPayload.totalPages || 1,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  useEffect(() => {
    const t = setTimeout(() => loadData(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  const updateDraft = (ticketId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [ticketId]: {
        ...(prev[ticketId] || {}),
        [field]: value,
      },
    }));
  };

  const saveTicket = async (ticketId) => {
    const draft = drafts[ticketId];
    if (!draft) return;

    try {
      await updateTicketApi(ticketId, {
        agentId: draft.agentId === "" ? null : Number(draft.agentId),
        status: draft.status,
      });

      toast.success("Ticket updated");
      await loadData(pageInfo.page);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update ticket");
    }
  };

  const openTicketDetail = (ticketId) => {
    if (!ticketId) {
      toast.error("Missing ticket id");
      return;
    }
    navigate(`/admin/tickets/${ticketId}`);
  };

  if (loading) return <LoadingState label="Loading tickets..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">All Tickets</h1>
        <p className="mt-2 text-slate-400">
          Assign agents, supervise progress, and manage ticket flow.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
          placeholder="Search tickets"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
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
          title="No tickets found"
          description="Adjust filters to see more tickets."
        />
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => {
            const draft = drafts[ticket.id] || {
              agentId: ticket.agentId ?? "",
              status: ticket.status ?? "OPEN",
            };
            const unreadCount = Number(ticket.unreadMessageCount || 0);

            return (
              <div
                key={ticket.id}
                className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80"
              >
                <div
                  className="grid cursor-pointer gap-4 lg:grid-cols-[1.2fr_0.8fr]"
                  onClick={() => openTicketDetail(ticket.id)}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {ticket.ticketNumber}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="text-left text-lg font-bold text-white transition hover:text-indigo-300 cursor-pointer"
                        >
                          {ticket.subject}
                        </button>

                        {unreadCount > 0 ? (
                          <span className="rounded-full bg-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/20">
                            {unreadCount}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-slate-400">{ticket.description}</p>
                    </div>

                    {ticket.attachmentUrl ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Ticket image
                        </p>
                        <img
                          src={ticket.attachmentUrl}
                          alt="Ticket attachment"
                          className="mt-3 h-28 w-auto max-w-[220px] rounded-xl border border-white/10 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/220x140?text=Preview+Not+Available";
                          }}
                        />
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <StatusBadge status={ticket.status} />
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        Priority: {ticket.priority}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        Customer: {ticket.customer?.name || "-"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openTicketDetail(ticket.id)}
                      className="inline-flex cursor-pointer rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
                    >
                      Open Ticket
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div className="relative w-full">
                        <select
                          value={draft.agentId}
                          onChange={(e) => updateDraft(ticket.id, "agentId", e.target.value)}
                          className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
                        >
                          <option value="" className="bg-slate-800 text-white">
                            Unassigned
                          </option>
                          {agents.map((agent) => (
                            <option
                              key={agent.id}
                              value={agent.id}
                              className="bg-slate-800 text-white"
                            >
                              {agent.name}
                            </option>
                          ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>

                      <div className="relative w-full">
                        <select
                          value={draft.status}
                          onChange={(e) => updateDraft(ticket.id, "status", e.target.value)}
                          className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
                        >
                          <option value="OPEN" className="bg-slate-800 text-white">OPEN</option>
                          <option value="IN_PROGRESS" className="bg-slate-800 text-white">IN_PROGRESS</option>
                          <option value="WAITING" className="bg-slate-800 text-white">WAITING</option>
                          <option value="RESOLVED" className="bg-slate-800 text-white">RESOLVED</option>
                          <option value="CLOSED" className="bg-slate-800 text-white">CLOSED</option>
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveTicket(ticket.id);
                        }}
                        className="w-full cursor-pointer rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600"
                      >
                        Confirm Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(nextPage) => loadData(nextPage)}
      />
    </div>
  );
}