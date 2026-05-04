import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getComplaintsApi, updateComplaintApi } from "../../api/complaintApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";

export default function AdminComplaints() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ status: "" });
  const [drafts, setDrafts] = useState({});

  const loadComplaints = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getComplaintsApi({
        page,
        limit: pageInfo.limit,
        status: filters.status,
      });

      const payload = res.data?.data ?? res.data;
      const rows = payload.rows || [];

      setComplaints(rows);

      const nextDrafts = {};
      rows.forEach((item) => {
        nextDrafts[item.id] = {
          status: item.status,
          resolutionNote: item.resolutionNote || "",
        };
      });
      setDrafts(nextDrafts);

      setPageInfo({
        page: payload.page || page,
        limit: payload.limit || 10,
        totalPages: payload.totalPages || 1,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  const updateDraft = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const saveComplaint = async (id) => {
    const draft = drafts[id];

    try {
      await updateComplaintApi(id, {
        status: draft.status,
        resolutionNote: draft.resolutionNote,
      });
      toast.success("Complaint updated");
      await loadComplaints(pageInfo.page);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update complaint");
    }
  };

  if (loading) return <LoadingState label="Loading complaints..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">All Complaints</h1>
        <p className="mt-2 text-slate-400">Review and resolve complaints from customers.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
        >
          <option value="" className="bg-slate-900 text-white">
            All status
          </option>
          <option value="OPEN" className="bg-slate-900 text-white">
            OPEN
          </option>
          <option value="UNDER_REVIEW" className="bg-slate-900 text-white">
            UNDER_REVIEW
          </option>
          <option value="ESCALATED" className="bg-slate-900 text-white">
            ESCALATED
          </option>
          <option value="RESOLVED" className="bg-slate-900 text-white">
            RESOLVED
          </option>
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="Adjust filters to see more complaints."
        />
      ) : (
        <div className="grid gap-4">
          {complaints.map((item) => {
            const draft = drafts[item.id] || {
              status: item.status,
              resolutionNote: item.resolutionNote || "",
            };

            return (
              <div
                key={item.id}
                className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80"
              >
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.category}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.description || "No description"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Ticket: {item.ticket?.ticketNumber || item.ticketId} | Customer:{" "}
                      {item.customer?.name || item.customerId}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created by: {item.creator?.name || item.createdBy}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created at:{" "}
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <StatusBadge status={item.status} />

                    <div className="relative w-full">
                      <select
                        value={draft.status}
                        onChange={(e) => updateDraft(item.id, "status", e.target.value)}
                        className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
                      >
                        <option value="OPEN" className="bg-slate-800 text-white">
                          OPEN
                        </option>
                        <option value="UNDER_REVIEW" className="bg-slate-800 text-white">
                          UNDER_REVIEW
                        </option>
                        <option value="ESCALATED" className="bg-slate-800 text-white">
                          ESCALATED
                        </option>
                        <option value="RESOLVED" className="bg-slate-800 text-white">
                          RESOLVED
                        </option>
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>

                    <textarea
                      value={draft.resolutionNote}
                      onChange={(e) => updateDraft(item.id, "resolutionNote", e.target.value)}
                      rows={3}
                      placeholder="Resolution note"
                      className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none"
                    />

                    <button
                      onClick={() => saveComplaint(item.id)}
                      className="w-full cursor-pointer rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600"
                    >
                      Confirm Update
                    </button>
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
        onPageChange={(nextPage) => loadComplaints(nextPage)}
      />
    </div>
  );
}