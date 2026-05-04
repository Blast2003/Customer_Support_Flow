import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getComplaintsApi } from "../../api/complaintApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";

export default function AgentComplaints() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getComplaintsApi({ page: 1, limit: 20 });
        const payload = res.data?.data ?? res.data;
        setComplaints(payload.rows || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState label="Loading complaints..." />;

  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No complaints"
        description="No complaints are assigned to tickets you work on."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Complaint Handling</h1>
        <p className="mt-2 text-slate-400">
          Review complaints linked to tickets assigned to you.
        </p>
      </div>

      <div className="grid gap-4">
        {complaints.map((item) => (
          <div
            key={item.id}
            className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{item.category}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {item.description || "No description"}
                </p>
                <div className="mt-3 text-xs text-slate-500">
                  <p>Ticket #{item.ticket?.ticketNumber || item.ticketId}</p>
                  <p>Customer: {item.customer?.name || item.customerId}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={item.status} />
                <span className="text-xs text-slate-400">Severity: {item.severity}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Created by {item.creator?.name || item.createdBy}</span>
              <span>
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}