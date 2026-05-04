import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Bell, ShieldCheck, Upload } from "lucide-react";
import { getDashboardApi } from "../../api/dashboardApi";
import LoadingState from "../../components/common/LoadingState";

function StatCard({ label, value, icon: Icon, accent }) {
  const map = {
    indigo: "from-indigo-500/20 to-violet-500/10 text-indigo-300",
    emerald: "from-emerald-500/20 to-teal-500/10 text-emerald-300",
    amber: "from-amber-500/20 to-orange-500/10 text-amber-300",
    sky: "from-sky-500/20 to-cyan-500/10 text-sky-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${map[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboardApi();
        setSummary(res.data?.data ?? res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (!summary) return null;

  const metrics = summary.metrics || {};

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-slate-900 p-8">
          <h1 className="text-4xl font-extrabold text-white">Welcome back</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Create support tickets, track status, reply in realtime, and raise complaints when needed.
          </p>
          <button
            onClick={() => navigate("/customer/new-ticket")}
            className=" cursor-pointer mt-6 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600"
          >
            Create Ticket
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold text-white">Current snapshot</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tickets</p>
              <p className="mt-2 text-lg font-bold text-white">{metrics.tickets || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Complaints</p>
              <p className="mt-2 text-lg font-bold text-white">{metrics.complaints || 0}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tickets" value={metrics.tickets || 0} icon={Ticket} accent="indigo" />
        <StatCard label="Notifications" value={metrics.notifications || 0} icon={Bell} accent="sky" />
        <StatCard label="Resolved" value="—" icon={ShieldCheck} accent="emerald" />
        <StatCard label="Uploads" value="—" icon={Upload} accent="amber" />
      </section>
    </div>
  );
}