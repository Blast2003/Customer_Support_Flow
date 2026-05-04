import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Ticket,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  DatabaseZap,
  PieChart,
  Layers3,
  BadgeCheck,
} from "lucide-react";
import { getDashboardApi } from "../../api/dashboardApi";
import LoadingState from "../../components/common/LoadingState";
import StatusBadge from "../../components/common/StatusBadge";

function AdminStatCard({ label, value, icon: Icon, tone }) {
  const toneMap = {
    violet: "from-violet-500/20 to-fuchsia-500/10 text-violet-300",
    sky: "from-sky-500/20 to-cyan-500/10 text-sky-300",
    amber: "from-amber-500/20 to-orange-500/10 text-amber-300",
    emerald: "from-emerald-500/20 to-teal-500/10 text-emerald-300",
  };

  return (
    <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${toneMap[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function AdminItem({ title, text, icon: Icon }) {
  return (
    <div className="cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-indigo-400/25 hover:bg-slate-800/80">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-violet-300">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboardApi();
        setSummary(res.data?.data ?? res.data ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState label="Loading admin dashboard..." />;

  const metrics = summary?.metrics || {};
  const recentTickets = Array.isArray(summary?.recentTickets) ? summary.recentTickets : [];
  const recentComplaints = Array.isArray(summary?.recentComplaints)
    ? summary.recentComplaints
    : [];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-slate-900 p-8 shadow-2xl shadow-black/10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            <Shield className="h-3.5 w-3.5" />
            Admin control center
          </div>

          <h1 className="mt-5 text-4xl font-extrabold text-white">
            Welcome back, Admin.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Monitor users, assign tickets, track SLA risk, review complaints, and inspect platform reports from one executive workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-violet-400/15 bg-violet-500/15 px-3 py-1 text-sm text-violet-300">
              Global visibility
            </span>
            <span className="rounded-full border border-sky-400/15 bg-sky-500/15 px-3 py-1 text-sm text-sky-300">
              Ticket assignment
            </span>
            <span className="rounded-full border border-amber-400/15 bg-amber-500/15 px-3 py-1 text-sm text-amber-300">
              SLA monitoring
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Platform health</p>
            <DatabaseZap className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Monitoring</p>
              <p className="mt-2 text-lg font-bold text-white">
                {metrics.users || 0} users active in system
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Admin, agents, and customers are connected and traceable.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk</p>
              <p className="mt-2 text-lg font-bold text-white">
                {metrics.slaBreached || 0} breached SLA records
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Keep an eye on overdue tickets and escalations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Users" value={metrics.users || 0} icon={Users} tone="violet" />
        <AdminStatCard label="Tickets" value={metrics.tickets || 0} icon={Ticket} tone="sky" />
        <AdminStatCard
          label="Complaints"
          value={metrics.complaints || 0}
          icon={ClipboardList}
          tone="amber"
        />
        <AdminStatCard
          label="SLA Alerts"
          value={(metrics.slaAtRisk || 0) + (metrics.slaBreached || 0)}
          icon={AlertTriangle}
          tone="emerald"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10">
          <h2 className="text-xl font-bold text-white">What you can do here</h2>
          <div className="mt-5 grid gap-4">
            <AdminItem
              icon={Users}
              title="Manage users"
              text="Review admins, agents, and customers under one secure role-based structure."
            />
            <AdminItem
              icon={Ticket}
              title="Assign and supervise tickets"
              text="Distribute workload and follow ticket movement across the support pipeline."
            />
            <AdminItem
              icon={BarChart3}
              title="View reports"
              text="Use analytics to understand performance, load, and service trends."
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900 p-6 shadow-lg shadow-black/10">
          <h2 className="text-xl font-bold text-white">Executive overview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Quick scan of the platform state, tickets, and complaints.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-violet-500/15 p-4">
              <p className="text-sm font-semibold text-violet-200">Users</p>
              <div className="mt-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400/40 to-fuchsia-400/10">
                <Users className="h-10 w-10 text-violet-200 opacity-80" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-sky-500/15 p-4">
              <p className="text-sm font-semibold text-sky-200">Tickets</p>
              <div className="mt-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/40 to-cyan-400/10">
                <Ticket className="h-10 w-10 text-sky-200 opacity-80" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-amber-500/15 p-4">
              <p className="text-sm font-semibold text-amber-200">Alerts</p>
              <div className="mt-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/40 to-orange-400/10">
                <AlertTriangle className="h-10 w-10 text-amber-200 opacity-80" />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <PieChart className="h-5 w-5 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-white">Analytics</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Layers3 className="h-5 w-5 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-white">Workflow</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <BadgeCheck className="h-5 w-5 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-white">Compliance</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="text-sm font-semibold text-white">Recent complaints</div>
            {recentComplaints.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white">{item.category}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {item.ticket?.ticketNumber || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">Recent tickets</h2>
          <div className="mt-4 space-y-3">
            {recentTickets.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-400">
                No recent tickets yet.
              </div>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {ticket.ticketNumber}
                      </p>
                      <p className="mt-1 font-semibold text-white">{ticket.subject}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {ticket.customer?.name || "-"} → {ticket.agent?.name || "Unassigned"}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">Key counters</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Agents</p>
              <p className="mt-1 text-2xl font-extrabold text-white">{metrics.agents || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Customers</p>
              <p className="mt-1 text-2xl font-extrabold text-white">{metrics.customers || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Open tickets</p>
              <p className="mt-1 text-2xl font-extrabold text-white">{metrics.openTickets || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Resolved</p>
              <p className="mt-1 text-2xl font-extrabold text-white">{metrics.resolvedTickets || 0}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}