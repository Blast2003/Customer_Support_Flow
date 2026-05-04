import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAgentsApi } from "../../api/userApi";
import { getTicketApi, updateTicketApi } from "../../api/ticketApi";
import LoadingState from "../../components/common/LoadingState";
import StatusBadge from "../../components/common/StatusBadge";
import { useSocket } from "../../socket/ContextSocket";

const LOCKED_STATUSES = ["RESOLVED", "CLOSED", "ESCALATED"];

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [draft, setDraft] = useState({
    agentId: "",
    status: "OPEN",
  });

  const isLocked = LOCKED_STATUSES.includes(ticket?.status);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketRes, agentsRes] = await Promise.all([getTicketApi(id), getAgentsApi()]);

      const ticketData = ticketRes.data?.data ?? ticketRes.data;
      const agentsData = agentsRes.data?.data ?? agentsRes.data;

      setTicket(ticketData);
      setAgents(agentsData || []);
      setDraft({
        agentId: ticketData.agentId ?? "",
        status: ticketData.status ?? "OPEN",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    const mergeTicket = (current, incoming) => {
      if (!incoming) return current;
      if (!current) return incoming;

      const currentMessages = Array.isArray(current.messages) ? current.messages : [];
      const incomingMessages = Array.isArray(incoming.messages) ? incoming.messages : [];

      const mergedMessages = [...currentMessages];
      const seenIds = new Set(mergedMessages.map((item) => String(item.id)));

      for (const msg of incomingMessages) {
        if (!seenIds.has(String(msg.id))) {
          mergedMessages.push(msg);
          seenIds.add(String(msg.id));
        }
      }

      mergedMessages.sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );

      return {
        ...current,
        ...incoming,
        messages: mergedMessages,
      };
    };

    const onTicketUpdated = ({ ticket: updated }) => {
      if (String(updated?.id) !== String(id)) return;

      setTicket((prev) => mergeTicket(prev, updated));
      setDraft({
        agentId: updated.agentId ?? "",
        status: updated.status ?? "OPEN",
      });
    };

    const onMessageCreated = ({ ticketId, message, ticket: updated }) => {
      if (String(ticketId) !== String(id)) return;

      if (updated) {
        setTicket((prev) => mergeTicket(prev, updated));
        setDraft({
          agentId: updated.agentId ?? "",
          status: updated.status ?? "OPEN",
        });
        return;
      }

      if (!message?.id) return;

      setTicket((prev) => {
        if (!prev) return prev;

        const exists = (prev.messages || []).some(
          (item) => String(item.id) === String(message.id)
        );
        if (exists) return prev;

        return {
          ...prev,
          messages: [...(prev.messages || []), message],
        };
      });
    };

    const onMessagesSeen = ({ ticketId, ticket: updated }) => {
      if (String(ticketId) !== String(id)) return;

      if (updated) {
        setTicket((prev) => mergeTicket(prev, updated));
        setDraft({
          agentId: updated.agentId ?? "",
          status: updated.status ?? "OPEN",
        });
      } else {
        loadData();
      }
    };

    socket.on("ticket:updated", onTicketUpdated);
    socket.on("ticket:messageCreated", onMessageCreated);
    socket.on("ticket:messagesSeen", onMessagesSeen);

    return () => {
      socket.off("ticket:updated", onTicketUpdated);
      socket.off("ticket:messageCreated", onMessageCreated);
      socket.off("ticket:messagesSeen", onMessagesSeen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id]);

  const saveTicket = async () => {
    if (isLocked) {
      toast.error(`This ticket is ${ticket.status.toLowerCase()} and cannot be modified here.`);
      return;
    }

    try {
      await updateTicketApi(id, {
        agentId: draft.agentId === "" ? null : Number(draft.agentId),
        status: draft.status,
      });
      toast.success("Ticket updated");
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update ticket");
    }
  };

  if (loading) return <LoadingState label="Loading ticket..." />;
  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin/tickets")}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to Tickets
      </button>

      {isLocked ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          This ticket is <span className="font-semibold">{ticket.status}</span>. Direct editing is locked here.
          Use the escalation page for escalation handling.
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {ticket.ticketNumber}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">{ticket.subject}</h1>
            <p className="mt-3 text-slate-400">{ticket.description}</p>

            {ticket.attachmentUrl ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ticket attachment
                </p>
                <div className="mt-3">
                  <img
                    src={ticket.attachmentUrl}
                    alt="Ticket attachment"
                    className="h-44 w-auto max-w-[280px] rounded-xl border border-white/10 object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/280x180?text=Preview+Not+Available";
                    }}
                  />
                  <a
                    href={ticket.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-indigo-300 hover:underline"
                  >
                    Open original file
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <StatusBadge status={ticket.status} />

            <div className="relative w-full">
              <select
                value={draft.agentId}
                disabled={isLocked}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, agentId: e.target.value }))
                }
                className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" className="bg-slate-800 text-white">
                  Unassigned
                </option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id} className="bg-slate-800 text-white">
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
                disabled={isLocked}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="OPEN" className="bg-slate-800 text-white">
                  OPEN
                </option>
                <option value="IN_PROGRESS" className="bg-slate-800 text-white">
                  IN_PROGRESS
                </option>
                <option value="WAITING" className="bg-slate-800 text-white">
                  WAITING
                </option>
                <option value="RESOLVED" className="bg-slate-800 text-white">
                  RESOLVED
                </option>
                <option value="CLOSED" className="bg-slate-800 text-white">
                  CLOSED
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            <button
              onClick={saveTicket}
              disabled={isLocked}
              className="w-full cursor-pointer rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-bold text-white">Conversation</h2>

          <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {(ticket.messages || []).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {item.sender?.name || "User"}
                </p>

                <p className="mt-2 text-sm text-slate-100">{item.message}</p>

                {item.attachmentUrl ? (
                  <div className="mt-3">
                    <img
                      src={item.attachmentUrl}
                      alt="Message attachment"
                      className="h-32 w-auto max-w-[220px] rounded-xl border border-white/10 object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/220x140?text=Preview+Not+Available";
                      }}
                    />
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-indigo-300 hover:text-indigo-200"
                    >
                      Open attachment
                    </a>
                  </div>
                ) : null}

                <div className="mt-3 text-right text-xs text-slate-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
            <p className="text-sm font-semibold text-white">Ticket info</p>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p>Priority: {ticket.priority}</p>
              <p>Status: {ticket.status}</p>
              <p>Customer: {ticket.customer?.name || "-"}</p>
              <p>Agent: {ticket.agent?.name || "-"}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
            <p className="text-sm font-semibold text-white">SLA / Complaints</p>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p>SLA: {ticket.slaRecord?.status || "-"}</p>
              <p>
                Response due:{" "}
                {ticket.slaRecord?.responseDueAt
                  ? new Date(ticket.slaRecord.responseDueAt).toLocaleString()
                  : "-"}
              </p>
              <p>
                Resolution due:{" "}
                {ticket.slaRecord?.resolutionDueAt
                  ? new Date(ticket.slaRecord.resolutionDueAt).toLocaleString()
                  : "-"}
              </p>
              <p>Complaints: {(ticket.complaints || []).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}