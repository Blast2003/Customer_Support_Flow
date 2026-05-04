import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createComplaintApi, getComplaintsApi } from "../../api/complaintApi";
import { getTicketsApi } from "../../api/ticketApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";

export default function CustomerComplaints() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({
    ticketId: "",
    category: "",
    severity: "MEDIUM",
    description: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketRes, complaintRes] = await Promise.all([
        getTicketsApi({ limit: 100 }),
        getComplaintsApi({ page: 1, limit: 20 }),
      ]);

      const ticketsPayload = ticketRes.data?.data ?? ticketRes.data;
      const complaintsPayload = complaintRes.data?.data ?? complaintRes.data;

      setTickets(ticketsPayload.rows || []);
      setComplaints(complaintsPayload.rows || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComplaintApi({
        ticketId: Number(form.ticketId),
        category: form.category,
        severity: form.severity,
        description: form.description,
      });

      toast.success("Complaint created");
      setForm({ ticketId: "", category: "", severity: "MEDIUM", description: "" });
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create complaint");
    }
  };

  if (loading) return <LoadingState label="Loading complaints..." />;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">My Complaints</h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Raise a complaint tied to one of your own tickets, then track its status below.
        </p>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              New complaint
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">Create a complaint</h2>
            <p className="mt-2 text-sm text-slate-400">
              Choose the related ticket, describe the issue, and set severity.
            </p>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-white/10" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Ticket</label>
              <div className="relative">
                <select
                  value={form.ticketId}
                  onChange={(e) => setForm((prev) => ({ ...prev, ticketId: e.target.value }))}
                  className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-500/50"
                >
                  <option value="" className="bg-slate-800 text-white">
                    Select ticket
                  </option>
                  {tickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id} className="bg-slate-800 text-white">
                      {ticket.ticketNumber} - {ticket.subject}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Severity</label>
              <div className="relative">
                <select
                  value={form.severity}
                  onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
                  className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-500/50"
                >
                  <option value="LOW" className="bg-slate-800 text-white">
                    LOW
                  </option>
                  <option value="MEDIUM" className="bg-slate-800 text-white">
                    MEDIUM
                  </option>
                  <option value="HIGH" className="bg-slate-800 text-white">
                    HIGH
                  </option>
                  <option value="CRITICAL" className="bg-slate-800 text-white">
                    CRITICAL
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Example: Wrong item, late delivery, damaged package"
              className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              placeholder="Describe the complaint in detail..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500">
              Your complaint will be linked to the selected ticket and shown in your list below.
            </p>
            <button className="cursor-pointer rounded-2xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600">
              Create Complaint
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              History
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">Your complaints</h2>
            <p className="mt-2 text-sm text-slate-400">
              View the complaints you have submitted and their current status.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs text-slate-400">Total complaints</p>
            <p className="text-lg font-bold text-white">{complaints.length}</p>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-white/10" />

        {complaints.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Complaints you create will appear here."
          />
        ) : (
          <div className="grid gap-4">
            {complaints.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.75rem] border border-white/10 bg-slate-800/50 p-5 transition hover:border-white/20 hover:bg-slate-800/80"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.category}</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-300">
                        Ticket #{item.ticket?.ticketNumber || item.ticketId}
                      </span>
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                      {item.description || "No description"}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Created at: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-slate-400">Severity: {item.severity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}