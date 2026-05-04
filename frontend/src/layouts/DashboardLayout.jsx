// layouts/DashboardLayout.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { getHomeRouteByRole } from "../utils/roleRoutes.js";
import { authApi } from "../api/authApi.js";
import toast from "react-hot-toast";
import { useNotificationStore } from "../store/notificationStore.js";
import {
  LayoutDashboard,
  Ticket,
  Users,
  MessageSquareWarning,
  BarChart3,
  ClipboardList,
  LogOut,
  Shield,
  Headphones,
  UserRound,
  Sparkles,
  Clock3,
  Bell,
} from "lucide-react";

const navByRole = {
  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/tickets", label: "Tickets", icon: Ticket },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
    { to: "/admin/escalations", label: "Escalations", icon: MessageSquareWarning },
    { to: "/admin/sla", label: "SLA", icon: Clock3 },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  ],
  AGENT: [
    { to: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/agent/tickets", label: "My Tickets", icon: ClipboardList },
    { to: "/agent/queue", label: "Queue", icon: Headphones },
    { to: "/agent/complaints", label: "Complaints", icon: MessageSquareWarning },
    { to: "/agent/escalations", label: "Escalations", icon: MessageSquareWarning },
  ],
  CUSTOMER: [
    { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/customer/tickets", label: "My Tickets", icon: Ticket },
    { to: "/customer/new-ticket", label: "New Ticket", icon: ClipboardList },
    { to: "/customer/complaints", label: "Complaints", icon: MessageSquareWarning },
  ],
};

function RoleBadge({ role }) {
  const styleMap = {
    ADMIN: "bg-violet-500/15 text-violet-300 border-violet-400/20",
    AGENT: "bg-sky-500/15 text-sky-300 border-sky-400/20",
    CUSTOMER: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  };

  const Icon = role === "ADMIN" ? Shield : role === "AGENT" ? Headphones : UserRound;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
        styleMap[role] || styleMap.CUSTOMER
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {role || "CUSTOMER"}
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const navItems = navByRole[user?.role] || navByRole.CUSTOMER;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error(error);
    } finally {
      logout();
      navigate("/login");
      toast.success("Logged out successfully");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_24%),linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-slate-100">
      <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-white/10 bg-slate-950/55 px-5 py-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div>
          <Link
            to={getHomeRouteByRole(user?.role)}
            className="block text-xl font-extrabold tracking-tight text-white"
          >
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
              Customer Support Flow
            </span>
          </Link>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Signed in as
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-100">
              {user?.name || "User"}
            </p>
            <div className="mt-3">
              <RoleBadge role={user?.role} />
            </div>

            <button
              onClick={() => navigate("/notifications")}
              className="mt-4 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-800/80"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-300" />
                <span className="text-sm font-medium text-white">Notifications</span>
              </div>

              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-2 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border border-white/10 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/20 hover:bg-rose-500/15 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-slate-900/40 p-4 shadow-lg shadow-black/10">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-violet-300" />
              <p className="text-sm font-semibold">SupportFlow</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Ticket handling, realtime chat, complaints, SLA monitoring, and role-based workflows.
            </p>
          </div>
        </div>
      </aside>

      <main className="ml-72 min-h-screen p-6 lg:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/35 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl lg:p-8">
          <div className="pointer-events-none absolute -top-20 right-0 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative">{children}</div>
        </div>
      </main>
    </div>
  );
}