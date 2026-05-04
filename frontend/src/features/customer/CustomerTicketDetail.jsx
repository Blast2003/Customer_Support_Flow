import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { addTicketMessageApi, getTicketApi } from "../../api/ticketApi";
import LoadingState from "../../components/common/LoadingState";
import StatusBadge from "../../components/common/StatusBadge";
import useFilePreview from "../../hooks/useFilePreview";
import useMarkTicketSeen from "../../hooks/useMarkTicketSeen";
import { useSocket } from "../../socket/ContextSocket";

export default function CustomerTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { socket } = useSocket();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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

  const loadTicket = async () => {
    setLoading(true);
    try {
      const res = await getTicketApi(id);
      const data = res.data?.data ?? res.data;
      setTicket(data);
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
    };

    const onMessageCreated = ({ ticketId, message, ticket: updated }) => {
      if (String(ticketId) !== String(id)) return;

      if (updated) {
        setTicket((prev) => mergeTicket(prev, updated));
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

  const handleSend = async (e) => {
    e.preventDefault();
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
      toast.success("Message sent");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState label="Loading ticket details..." />;
  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/customer/tickets")}
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

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
        <h1 className="text-3xl font-extrabold text-white">{ticket.subject}</h1>
        <p className="mb-2 mt-3 text-slate-400">{ticket.description}</p>
        <StatusBadge status={ticket.status} />

        {ticket.attachmentUrl ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ticket attachment
            </p>
            <img
              src={ticket.attachmentUrl}
              alt="Ticket attachment"
              className="mt-3 max-h-40 rounded-xl border border-white/10"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-white">Conversation</h2>

        <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {(ticket.messages || []).map((item) => {
            const mine = item.senderId === ticket.customerId;

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

        <form onSubmit={handleSend} className="mt-6 space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write your reply..."
            className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-400"
          />

          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-800 px-4 py-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">
                  {fileName || "No file chosen"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Choose an image or PDF to send with your message.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="cursor-pointer rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600"
                >
                  Choose File
                </button>

                {fileName ? (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            {previewUrl ? (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Attachment preview"
                  className="max-h-52 w-auto rounded-xl border border-white/10 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : null}
          </div>

          <button
            disabled={sending}
            className="cursor-pointer rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}