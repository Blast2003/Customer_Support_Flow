import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getEscalationsApi,
  updateEscalationApi,
  createEscalationApi,
} from "../../api/escalationRequestApi";
import { getTicketsApi } from "../../api/ticketApi";
import { getAgentsApi } from "../../api/userApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { useAuthStore } from "../../store/authStore";

const initialCreateState = {
  ticketId: "",
  reason: "",
};

const initialActionState = {
  targetUserId: "",
  resolutionNote: "",
};

export default function EscalationRequestsPage() {
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [items, setItems] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [status, setStatus] = useState("");
  const [actionState, setActionState] = useState({});
  const [actionErrors, setActionErrors] = useState({});
  const [createState, setCreateState] = useState(initialCreateState);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const loadEscalations = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getEscalationsApi({
        page,
        limit: pageInfo.limit,
        ...(status ? { status } : {}),
      });

      const payload = res.data?.data ?? res.data;
      setItems(payload.rows || []);
      setPageInfo({
        page: payload.page || page,
        limit: payload.limit || 10,
        totalPages: payload.totalPages || 1,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load escalations");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedTickets = async () => {
    if (user?.role !== "AGENT") return;

    setTicketsLoading(true);
    try {
      const res = await getTicketsApi({
        page: 1,
        limit: 200,
        scope: "assigned",
      });

      const payload = res.data?.data ?? res.data;
      setAssignedTickets(payload.rows || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load assigned tickets");
      setAssignedTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const res = await getAgentsApi({ limit: 200 });
      const payload = res.data?.data ?? res.data;
      const rows = Array.isArray(payload) ? payload : payload.rows || [];
      setAgents(rows.filter((item) => item?.role === "AGENT"));
    } catch {
      setAgents([]);
    }
  };

  useEffect(() => {
    loadEscalations(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (user?.role === "AGENT") {
      loadAssignedTickets();
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadAgents();
    }
  }, [user?.role]);

  const saveEscalation = async (id, payload) => {
    setSavingId(id);
    try {
      await updateEscalationApi(id, payload);
      toast.success("Escalation updated");
      await loadEscalations(pageInfo.page);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update escalation");
    } finally {
      setSavingId(null);
    }
  };

  const createEscalation = async () => {
    if (!createState.ticketId) {
      toast.error("Please choose a ticket");
      return;
    }

    if (!createState.reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    setCreating(true);
    try {
      await createEscalationApi({
        ticketId: Number(createState.ticketId),
        reason: createState.reason.trim(),
      });

      toast.success("Escalation created");
      setCreateState(initialCreateState);
      await loadEscalations(1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create escalation");
    } finally {
      setCreating(false);
    }
  };

  const updateDraft = (id, patch) => {
    setActionState((prev) => ({
      ...prev,
      [id]: {
        ...initialActionState,
        ...(prev[id] || {}),

        ...patch,
      },
    }));

    setActionErrors((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const setRowError = (id, message) => {
    setActionErrors((prev) => ({
      ...prev,
      [id]: message,
    }));
  };

  const getDraft = (id) => actionState[id] || initialActionState;

  const handleReject = async (item) => {
    const draft = getDraft(item.id);

    if (item.status !== "OPEN" && item.status !== "UNDER_REVIEW") {
      toast.error("This escalation is already finalized");
      return;
    }

    await saveEscalation(item.id, {
      action: "REJECT",
      resolutionNote: draft.resolutionNote,
    });
  };

  const handleHandleDirect = async (item) => {
    const draft = getDraft(item.id);

    if (item.status !== "OPEN" && item.status !== "UNDER_REVIEW") {
      toast.error("This escalation is already finalized");
      return;
    }

    await saveEscalation(item.id, {
      action: "HANDLE_DIRECTLY",
      resolutionNote: draft.resolutionNote,
      ticketStatus: "IN_PROGRESS",
    });
  };

  const handleReassign = async (item) => {
    const draft = getDraft(item.id);

    if (item.status !== "OPEN" && item.status !== "UNDER_REVIEW") {
      toast.error("This escalation is already finalized");
      return;
    }

    if (!draft.targetUserId) {
      setRowError(item.id, "Please choose an agent first");
      toast.error("Please choose an agent first");
      return;
    }

    if (item.ticket?.agentId && String(draft.targetUserId) === String(item.ticket.agentId)) {
      const message = "This ticket is already assigned to that agent";
      setRowError(item.id, message);
      toast.error(message);
      return;
    }

    await saveEscalation(item.id, {
      action: "REASSIGN",
      targetUserId: draft.targetUserId,
      resolutionNote: draft.resolutionNote,
      ticketStatus: "IN_PROGRESS",
    });
  };

  const agentOptions = useMemo(
    () =>
      agents.map((agent) => ({
        id: agent.id,
        label: agent.name || agent.email || `Agent #${agent.id}`,
      })),
    [agents]
  );

  const formatCreatedAt = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  if (loading) return <LoadingState label="Loading escalations..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Escalation Requests</h1>
        <p className="mt-2 text-slate-400">
          Review escalations, reject bad ones, reassign tickets, or handle them directly.
        </p>
      </div>

      {user?.role === "AGENT" ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5">
          <h2 className="text-xl font-bold text-white">Create Escalation</h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose one of your assigned tickets and send it for admin review.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Assigned ticket</label>
              <div className="relative w-full">
                <select
                  value={createState.ticketId}
                  onChange={(e) =>
                    setCreateState((prev) => ({ ...prev, ticketId: e.target.value }))
                  }
                  disabled={ticketsLoading}
                  className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400 disabled:opacity-60"
                >
                  <option value="" className="bg-slate-800">
                    {ticketsLoading ? "Loading tickets..." : "Choose ticket"}
                  </option>
                  {assignedTickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id} className="bg-slate-800">
                      {ticket.ticketNumber} — {ticket.subject}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Reason</label>
              <input
                value={createState.reason}
                onChange={(e) =>
                  setCreateState((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Reason for escalation"
                className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={createEscalation}
            disabled={creating}
            className="cursor-pointer mt-4 rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Escalate Ticket"}
          </button>

          {assignedTickets.length === 0 && !ticketsLoading ? (
            <p className="mt-3 text-sm text-slate-400">
              No assigned tickets found for your account.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="relative w-full max-w-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
        >
          <option value="" className="bg-slate-900 text-white">All status</option>
          <option value="OPEN" className="bg-slate-900 text-white">OPEN</option>
          <option value="UNDER_REVIEW" className="bg-slate-900 text-white">UNDER_REVIEW</option>
          <option value="APPROVED" className="bg-slate-900 text-white">APPROVED</option>
          <option value="REJECTED" className="bg-slate-900 text-white">REJECTED</option>
          <option value="RESOLVED" className="bg-slate-900 text-white">RESOLVED</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No escalation requests" description="Nothing to review right now." />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const canAct =
              user?.role === "ADMIN" && ["OPEN", "UNDER_REVIEW"].includes(item.status);
            const draft = getDraft(item.id);
            const rowError = actionErrors[item.id] || "";

            return (
              <div
                key={item.id}
                className="relative rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  #{item.id} • {item.status}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {item.ticket?.ticketNumber || "Ticket"}
                  </h3>
                  {item.ticket?.slaRecord?.status ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      SLA: {item.ticket.slaRecord.status}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm text-slate-300">{item.reason}</p>

                <div className="mt-4 grid gap-2 text-sm text-slate-400 md:grid-cols-2">
                  <p>Created by: {item.creator?.name || item.creator?.email || "-"}</p>
                  <p>Handled by: {item.handler?.name || item.handler?.email || "-"}</p>
                  <p>Target role: {item.targetRole}</p>
                  <p>Direction: {item.direction}</p>
                  <p>Customer: {item.ticket?.customer?.name || item.ticket?.customer?.email || "-"}</p>
                  <p>Assigned agent: {item.ticket?.agent?.name || item.ticket?.agent?.email || "-"}</p>
                </div>

                {canAct ? (
                  <div className="mt-5 space-y-3 rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Reassign to agent</label>
                        <div className="relative w-full">
                          <select
                            value={draft.targetUserId}
                            onChange={(e) =>
                              updateDraft(item.id, { targetUserId: e.target.value })
                            }
                            className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
                          >
                            <option value="" className="bg-slate-800 text-white">
                              Choose agent
                            </option>
                            {agentOptions.map((agent) => {
                              const isSameAsCurrentAgent =
                                item.ticket?.agentId &&
                                String(agent.id) === String(item.ticket.agentId);

                              return (
                                <option
                                  key={agent.id}
                                  value={agent.id}
                                  disabled={isSameAsCurrentAgent}
                                  className="bg-slate-800 text-white"
                                >
                                  {agent.label}
                                  {isSameAsCurrentAgent ? " (current agent)" : ""}
                                </option>
                              );
                            })}
                          </select>

                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>

                        {rowError ? (
                          <p className="mt-2 text-sm text-rose-300">{rowError}</p>
                        ) : null}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-slate-300">
                          Resolution note
                        </label>
                        <textarea
                          rows={3}
                          value={draft.resolutionNote}
                          onChange={(e) =>
                            updateDraft(item.id, { resolutionNote: e.target.value })
                          }
                          placeholder="Add review note..."
                          className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => handleReassign(item)}
                        className="cursor-pointer rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === item.id ? "Saving..." : "Reassign ticket"}
                      </button>

                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => handleReject(item)}
                        className="cursor-pointer rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject escalation
                      </button>

                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => handleHandleDirect(item)}
                        className="cursor-pointer rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Handle directly
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 text-right text-xs text-slate-500">
                  Created at: {formatCreatedAt(item.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(nextPage) => loadEscalations(nextPage)}
      />
    </div>
  );
}