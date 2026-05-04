import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  addTicketMessageApi,
  escalateTicketApi,
  getTicketApi,
  resolveTicketApi,
  updateTicketApi,
} from "../../api/ticketApi";
import LoadingState from "../../components/common/LoadingState";
import StatusBadge from "../../components/common/StatusBadge";
import useFilePreview from "../../hooks/useFilePreview";
import useMarkTicketSeen from "../../hooks/useMarkTicketSeen";
import { useSocket } from "../../socket/ContextSocket";

const LOCKED_STATUSES = ["RESOLVED", "CLOSED", "ESCALATED"];

export default function AgentTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { socket } = useSocket();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("IN_PROGRESS");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  const {
    inputRef,
    fileName,
    fileBase64,
    previewUrl,
    handleFileChange,
    triggerFilePicker,
    clearFile,
  } = useFilePreview();

  useMarkTicketSeen(id);

  const isLocked = LOCKED_STATUSES.includes(ticket?.status);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const res = await getTicketApi(id);
      const data = res.data?.data ?? res.data;

      setTicket(data);
      setStatus(data.status || "IN_PROGRESS");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
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
      setStatus(updated.status || "IN_PROGRESS");
    };

    const onMessageCreated = ({ ticketId, message, ticket: updated }) => {
      if (String(ticketId) !== String(id)) return;

      if (updated) {
        setTicket((prev) => mergeTicket(prev, updated));
        setStatus(updated.status || "IN_PROGRESS");
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
        setStatus(updated.status || "IN_PROGRESS");
      } else {
        loadTicket();
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

  const sendReply = async (e) => {
    e.preventDefault();

    if (isLocked) {
      toast.error(`This ticket is ${ticket.status.toLowerCase()} and cannot be replied to here.`);
      return;
    }

    if (!message.trim()) return;

    setSending(true);
    try {
      await addTicketMessageApi(id, {
        message,
        attachmentFile: fileBase64 || undefined,
      });

      setMessage("");
      clearFile();
      await loadTicket();
      toast.success("Reply sent");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const saveStatus = async () => {
    if (isLocked) {
      toast.error(`This ticket is ${ticket.status.toLowerCase()} and cannot be modified here.`);
      return;
    }

    try {
      await updateTicketApi(id, { status });
      await loadTicket();
      toast.success("Status updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const resolveNow = async () => {
    if (isLocked) {
      toast.error(`This ticket is ${ticket.status.toLowerCase()} and cannot be resolved here.`);
      return;
    }

    try {
      await resolveTicketApi(id);
      await loadTicket();
      toast.success("Ticket resolved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resolve ticket");
    }
  };

  const escalateNow = async () => {
    if (isLocked) {
      toast.error(`This ticket is ${ticket.status.toLowerCase()} and cannot be escalated here.`);
      return;
    }

    try {
      await escalateTicketApi(id, { reason });
      await loadTicket();
      toast.success("Ticket escalated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to escalate ticket");
    }
  };

  if (loading) return <LoadingState label="Loading ticket..." />;
  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/agent/tickets")}
        className="cursor-pointer text-sm text-slate-400 hover:text-white"
      >
        ← Back
      </button>

      {isLocked ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          This ticket is <span className="font-semibold">{ticket.status}</span>. Direct actions are locked here.
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
        <h1 className="text-3xl font-extrabold text-white">{ticket.subject}</h1>
        <p className="mb-2 mt-3 text-slate-400">{ticket.description}</p>

        {ticket.attachmentUrl && (
          <img
            src={ticket.attachmentUrl}
            alt="ticket"
            className="mt-4 max-h-52 rounded-xl border border-white/10"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <StatusBadge status={ticket.status} />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-white">Conversation</h2>

        <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto">
          {(ticket.messages || []).map((item) => {
            const mine = item.senderId === ticket.agentId;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  mine
                    ? "ml-auto max-w-[85%] border-indigo-400/20 bg-indigo-500/10"
                    : "max-w-[85%] border-white/10 bg-white/5"
                }`}
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

                {mine ? (
                  <div className="mt-3 text-right text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {item.seen ? "Seen" : "Unseen"}
                  </div>
                ) : null}

                <div className="mt-3 text-right text-xs text-slate-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={sendReply} className="mt-6 space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            disabled={isLocked}
            placeholder={isLocked ? "This ticket is locked." : "Write your reply..."}
            className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-800 px-4 py-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              disabled={isLocked}
              className="hidden"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">
                  {fileName || "No file chosen"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Attach image or PDF for better support.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  disabled={isLocked}
                  className="cursor-pointer rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Choose File
                </button>

                {fileName && (
                  <button
                    type="button"
                    onClick={clearFile}
                    disabled={isLocked}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="max-h-52 rounded-xl border border-white/10"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          <button
            disabled={sending || isLocked}
            className="cursor-pointer rounded-2xl bg-indigo-500 px-5 py-3 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Reply"}
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-bold text-white">Ticket actions</h2>
          <div className="mt-4 space-y-3">
            <button
              onClick={resolveNow}
              disabled={isLocked}
              className="w-full cursor-pointer rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resolve Ticket
            </button>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={isLocked}
              placeholder={isLocked ? "This ticket is locked." : "Escalation reason (optional)"}
              className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              onClick={escalateNow}
              disabled={isLocked}
              className="w-full cursor-pointer rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Escalate Ticket
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm font-semibold text-white">Ticket info</p>
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <p>Priority: {ticket.priority}</p>
            <p>Status: {ticket.status}</p>
            <p>Customer: {ticket.customer?.name || "-"}</p>
            <p>Agent: {ticket.agent?.name || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}