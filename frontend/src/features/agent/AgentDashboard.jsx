import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  MessageSquareReply,
  ClipboardCheck,
  TimerReset,
  AlertTriangle,
  Workflow,
  Ticket,
} from "lucide-react";
import { getDashboardApi } from "../../api/dashboardApi";
import LoadingState from "../../components/common/LoadingState";
import StatusBadge from "../../components/common/StatusBadge";

function AgentStatCard({ label, value, icon: Icon, tone }) {
  const toneMap = {
    sky: "from-sky-500/20 to-cyan-500/10 text-sky-300",
    amber: "from-amber-500/20 to-orange-500/10 text-amber-300",
    emerald: "from-emerald-500/20 to-teal-500/10 text-emerald-300",
    rose: "from-rose-500/20 to-pink-500/10 text-rose-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 cursor-pointer">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneMap[tone]} border border-white/10`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function WorkItem({ title, text, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-indigo-400/25 hover:bg-slate-800/80 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/5 p-2 text-sky-300 border border-white/10">
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

export default function AgentDashboard() {
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

  if (loading) return <LoadingState label="Loading agent dashboard..." />;

  const metrics = summary?.metrics || {};
  const recentTickets = summary?.recentTickets || [];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-slate-900 p-8 shadow-2xl shadow-black/10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            <Headphones className="h-3.5 w-3.5" />
            Agent workspace
          </div>

          <h1 className="mt-5 text-4xl font-extrabold text-white">
            Welcome back, Agent.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Handle assigned tickets, reply to customers, keep the queue moving, and resolve or escalate issues quickly.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm text-sky-300 border border-sky-400/15">
              Assigned tickets
            </span>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm text-amber-300 border border-amber-400/15">
              Queue management
            </span>
            <span className="rounded-full bg-rose-500/15 px-3 py-1 text-sm text-rose-300 border border-rose-400/15">
              Escalations
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Agent priorities</p>
            <Workflow className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Today</p>
              <p className="mt-2 text-lg font-bold text-white">Respond fast</p>
              <p className="mt-1 text-sm text-slate-400">
                Keep conversations active and reduce response time.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus</p>
              <p className="mt-2 text-lg font-bold text-white">SLA awareness</p>
              <p className="mt-1 text-sm text-slate-400">
                Watch deadlines and escalation risk closely.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AgentStatCard
          label="Assigned"
          value={metrics.assignedTickets || 0}
          icon={ClipboardCheck}
          tone="sky"
        />
        <AgentStatCard
          label="Waiting Reply"
          value={metrics.waitingReply || 0}
          icon={MessageSquareReply}
          tone="amber"
        />
        <AgentStatCard
          label="Resolved Today"
          value={metrics.resolvedToday || 0}
          icon={TimerReset}
          tone="emerald"
        />
        <AgentStatCard
          label="Escalations"
          value={metrics.escalations || 0}
          icon={AlertTriangle}
          tone="rose"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10">
          <h2 className="text-xl font-bold text-white">What you can do here</h2>
          <div className="mt-5 grid gap-4">
            <WorkItem
              icon={ClipboardCheck}
              title="Manage assigned tickets"
              text="Review ticket details, update statuses, and move each case forward."
            />
            <WorkItem
              icon={MessageSquareReply}
              title="Reply to customers"
              text="Keep the conversation clear, helpful, and fast inside the ticket thread."
            />
            <WorkItem
              icon={AlertTriangle}
              title="Handle escalations"
              text="Spot urgent issues early and escalate cases that need admin attention."
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900 p-6 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent assigned work</h2>
            <Ticket className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            {recentTickets.length === 0 ? (
              <p className="text-sm text-slate-400">No recent tickets.</p>
            ) : (
              recentTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {ticket.ticketNumber}
                      </p>
                      <p className="mt-1 font-semibold text-white">{ticket.subject}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}