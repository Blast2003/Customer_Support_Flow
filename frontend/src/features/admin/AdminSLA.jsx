import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSLAApi, getSlaSummaryApi } from "../../api/slaApi";
import LoadingState from "../../components/common/LoadingState";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";

export default function AdminSLA() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, totalPages: 1 });

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        getSLAApi({ page, limit: pageInfo.limit }),
        getSlaSummaryApi(),
      ]);

      const listPayload = listRes.data?.data ?? listRes.data;
      const summaryPayload = summaryRes.data?.data ?? summaryRes.data;

      setRecords(listPayload.rows || []);
      setSummary(summaryPayload);
      setPageInfo({
        page: listPayload.page || page,
        limit: listPayload.limit || 10,
        totalPages: listPayload.totalPages || 1,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load SLA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingState label="Loading SLA records..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">SLA Monitoring</h1>
        <p className="mt-2 text-slate-400">
          Track deadlines, breaches, and resolution performance.
        </p>
      </div>

      {summary ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">On Track</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{summary.onTrack}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">At Risk</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{summary.atRisk}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Breached</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{summary.breached}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Resolved</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{summary.resolved}</p>
          </div>
        </div>
      ) : null}

      {records.length === 0 ? (
        <EmptyState title="No SLA records" description="SLA records will appear here." />
      ) : (
        <div className="grid gap-4">
          {records.map((item) => (
            <div key={item.id} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.ticket?.ticketNumber || `Ticket #${item.ticketId}`}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Response due: {item.responseDueAt ? new Date(item.responseDueAt).toLocaleString() : "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Resolution due: {item.resolutionDueAt ? new Date(item.resolutionDueAt).toLocaleString() : "-"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </div>
          ))}
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