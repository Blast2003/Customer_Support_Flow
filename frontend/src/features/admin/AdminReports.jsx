import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarRange,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";

import { getAdminReportApi } from "../../api/reportApi";
import LoadingState from "../../components/common/LoadingState";

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#a855f7",
  "#f97316",
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((Number(part || 0) / Number(total)) * 100);
}

function Card({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            {formatNumber(value)}
          </p>
          {subtitle ? (
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Panel({ title, description, children, className = "" }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ text = "No data for this year yet." }) {
  return (
    <div className="flex h-80 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
      {text}
    </div>
  );
}

function DonutCard({ title, items, description }) {
  const chartData = useMemo(() => {
    return (items || [])
      .filter((item) => Number(item.count) > 0)
      .map((item, index) => ({
        name: item.label,
        value: Number(item.count),
        fill: COLORS[index % COLORS.length],
      }));
  }, [items]);

  const total = useMemo(
    () => (items || []).reduce((sum, item) => sum + Number(item.count || 0), 0),
    [items]
  );

  return (
    <Panel title={title} description={description}>
      {chartData.length ? (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#cbd5e1" }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {(items || []).map((item, index) => {
              const count = Number(item.count || 0);
              const pct = percent(count, total);

              return (
                <div
                  key={`${title}-${item.label}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {formatNumber(count)} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyChart />
      )}
    </Panel>
  );
}

function BarListCard({ title, items, description }) {
  const max = useMemo(() => {
    return Math.max(...(items || []).map((i) => Number(i.count || 0)), 1);
  }, [items]);

  return (
    <Panel title={title} description={description}>
      {(items || []).length ? (
        <div className="space-y-4">
          {(items || []).map((item, index) => {
            const value = Number(item.count || 0);
            const width = `${(value / max) * 100}%`;

            return (
              <div key={`${title}-${item.label}`} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-200">{item.label}</span>
                  <span className="text-slate-400">{formatNumber(value)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width,
                      background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, rgba(255,255,255,0.15))`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyChart />
      )}
    </Panel>
  );
}

function TrendCard({ data }) {
  // Removed "notifications" from check
  const hasData = (data || []).some((item) =>
    ["tickets", "complaints", "escalations"].some(
      (key) => Number(item[key] || 0) > 0
    )
  );

  return (
    <Panel
      title="Monthly activity"
      description="Track how support activity changes across the selected year."
      className="lg:col-span-2"
    >
      {hasData ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  color: "#fff",
                }}
                labelStyle={{ color: "#cbd5e1" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="complaints"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="escalations"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={false}
              />
              {/* Removed Notifications Line */}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChart text="No activity found in the selected year." />
      )}
    </Panel>
  );
}

function TopAgentsCard({ items }) {
  return (
    <Panel
      title="Top agent load"
      description="See which agents handled the most tickets in the selected year."
      className="lg:col-span-2"
    >
      {(items || []).length ? (
        <div className="space-y-3">
          {(items || []).map((item, index) => (
            <div
              key={item.agentId ?? index}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">
                    {item.agent?.name || "Unassigned"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.agent?.email || "No agent account"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-right">
                  <p className="text-xs text-slate-400">Tickets</p>
                  <p className="text-lg font-bold text-white">
                    {formatNumber(item.ticketCount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyChart text="No agent data found for this year." />
      )}
    </Panel>
  );
}

export default function AdminReports() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= 2024; y -= 1) years.push(y);
    return years;
  }, [currentYear]);

  const loadReport = async (year) => {
    setLoading(true);
    setError("");

    try {
      const res = await getAdminReportApi(year);
      setReport(res.data?.data ?? res.data);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load reports";
      setError(message);
      setReport(null);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(selectedYear);
  }, [selectedYear]);

  const cards = useMemo(() => {
    if (!report) return [];

    return [
      {
        title: "Users",
        value: report.totals?.users || 0,
        subtitle: `Created in ${selectedYear}`,
        icon: Users,
      },
      {
        title: "Tickets",
        value: report.totals?.tickets || 0,
        subtitle: `All tickets in ${selectedYear}`,
        icon: Ticket,
      },
      {
        title: "Resolved tickets",
        value: report.totals?.resolvedTickets || 0,
        subtitle: `${report.rates?.ticketResolutionRate || 0}% resolution rate`,
        icon: Activity,
      },
      {
        title: "Complaints",
        value: report.totals?.complaints || 0,
        subtitle: `Service complaints in ${selectedYear}`,
        icon: AlertTriangle,
      },
      {
        title: "Escalations",
        value: report.totals?.escalations || 0,
        subtitle: `Escalation requests this year`,
        icon: BarChart3,
      },
      {
        title: "SLA breached",
        value: report.totals?.breachedSla || 0,
        subtitle: `${report.rates?.slaBreachRate || 0}% breach rate`,
        icon: Activity, // Switched from BellRing
      },
    ];
  }, [report, selectedYear]);

  if (loading) {
    return <LoadingState label={`Loading ${selectedYear} reports...`} />;
  }

  if (error && !report) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 text-center">
        <p className="text-lg font-bold text-white">Reports could not be loaded</p>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <button
          type="button"
          onClick={() => loadReport(selectedYear)}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-300">
              Admin analytics
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Reports
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Clean yearly analytics for tickets, complaints, escalations, SLA, and agent workload.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CalendarRange className="h-4 w-4 text-indigo-300" />
                <span>Report year</span>
              </div>
              
              <div className="relative mt-2 w-full">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 pr-9 text-sm text-white outline-none transition focus:border-indigo-400"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year} className="bg-slate-950 text-white">
                      {year}
                    </option>
                  ))}
                </select>

                {/* Custom Arrow Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadReport(selectedYear)}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            {report.period?.label || `${selectedYear}`}
          </span>
          {/* Removed Notification badges from here */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
          />
        ))}
      </div>

      <TrendCard data={report.monthlyActivity || []} />

      <div className="grid gap-6 xl:grid-cols-2">
        <DonutCard
          title="Tickets by status"
          description="Ticket state distribution for the selected year."
          items={report.ticketByStatus || []}
        />
        <BarListCard
          title="Tickets by priority"
          description="How many tickets are low, medium, high, or urgent."
          items={report.ticketByPriority || []}
        />

        <DonutCard
          title="Complaints by severity"
          description="Severity breakdown of customer complaints."
          items={report.complaintBySeverity || []}
        />
        <DonutCard
          title="SLA by status"
          description="Current SLA record status distribution."
          items={report.slaByStatus || []}
        />

        <BarListCard
          title="Escalations by status"
          description="Open, approved, rejected, and closed escalations."
          items={report.escalationByStatus || []}
        />
        {/* Removed BarListCard for Notifications by type */}
      </div>

      <TopAgentsCard items={report.agentLoad || []} />
    </div>
  );
}