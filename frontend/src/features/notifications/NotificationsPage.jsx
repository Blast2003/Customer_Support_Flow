// pages/NotificationsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Bell, CheckCheck } from "lucide-react";
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../../api/notificationApi";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { useSocket } from "../../socket/ContextSocket";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);

  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [filter, setFilter] = useState("all");

  const syncUnreadCount = async () => {
    try {
      const res = await getNotificationsApi({
        page: 1,
        limit: 1,
        isRead: false,
      });

      const payload = res.data?.data ?? res.data;
      setUnreadCount(Number(payload?.unreadCount ?? payload?.count ?? 0));
    } catch {
      // ignore
    }
  };

  const loadNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getNotificationsApi({
        page,
        limit: pageInfo.limit,
        ...(filter === "unread" ? { isRead: false } : {}),
      });

      const payload = res.data?.data ?? res.data;

      setItems(payload.rows || []);
      setPageInfo({
        page: payload.page || page,
        limit: payload.limit || 10,
        totalPages: payload.totalPages || 1,
      });

      setUnreadCount(Number(payload?.unreadCount ?? 0));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (!socket) return;

    const onNotificationCreated = (payload) => {
      const created = payload?.notifications?.[0] || payload?.notification;
      if (!created) return;

      setItems((prev) => [created, ...prev]);
    };

    socket.on("notification:created", onNotificationCreated);

    return () => {
      socket.off("notification:created", onNotificationCreated);
    };
  }, [socket]);

  const handleRead = async (notification) => {
    const ticketId = notification?.meta?.ticketId;
    const role = user?.role?.toUpperCase();
    const type = notification?.type?.toUpperCase();

    try {
      // 1. Mark as read (same as before)
      if (!notification.isRead) {
        await markNotificationReadApi(notification.id);
        markAsRead(notification.id);

        setItems((prev) =>
          filter === "unread"
            ? prev.filter((item) => item.id !== notification.id)
            : prev.map((item) =>
                item.id === notification.id ? { ...item, isRead: true } : item
              )
        );

        await syncUnreadCount();
      }

      // 2. Base routes
      let ticketBase = "/customer/tickets";
      if (role === "ADMIN") ticketBase = "/admin/tickets";
      else if (role === "AGENT") ticketBase = "/agent/tickets";

      // 3. Navigation logic by type
      // ---------------------------------
      if (type === "ESCALATION") {
        // Only ADMIN + AGENT have escalation pages
        if (role === "ADMIN") {
          return navigate("/admin/escalations");
        }
        if (role === "AGENT") {
          return navigate("/agent/escalations");
        }

        // CUSTOMER fallback → ticket detail
        if (ticketId) {
          return navigate(`${ticketBase}/${ticketId}`);
        }
      }

      if (type === "COMPLAINT") {
        if (role === "ADMIN") {
          return navigate("/admin/complaints");
        }
        if (role === "AGENT") {
          return navigate("/agent/complaints");
        }
        if (role === "CUSTOMER") {
          return navigate("/customer/complaints");
        }
      }

      // Optional: MESSAGE → go to ticket detail (chat)
      if (type === "MESSAGE") {
        if (ticketId) {
          return navigate(`${ticketBase}/${ticketId}`);
        }
      }

      // Optional: SLA → still ticket (best UX)
      if (type === "SLA") {
        if (ticketId) {
          return navigate(`${ticketBase}/${ticketId}`);
        }
      }

      // Default fallback (TICKET + unknown types)
      if (ticketId) {
        return navigate(`${ticketBase}/${ticketId}`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to mark notification as read"
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      await syncUnreadCount();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to mark all notifications as read");
    }
  };

  if (loading) return <LoadingState label="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Notifications</h1>
          <p className="mt-2 text-slate-400">
            Live announcements for tickets, SLA, complaints, and escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`cursor-pointer rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              filter === "all"
                ? "bg-indigo-500 text-white"
                : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("unread")}
            className={`cursor-pointer rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              filter === "unread"
                ? "bg-indigo-500 text-white"
                : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            Unread
          </button>

          <button
            onClick={handleMarkAllRead}
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Mark all read
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You will see announcements here when something changes."
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRead(item)}
              className="cursor-pointer w-full rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:bg-slate-800/80"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Bell className="h-5 w-5 text-slate-300" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold text-white">{item.title}</p>

                    {!item.isRead ? (
                      <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        NEW
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                        READ
                      </span>
                    )}

                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                      {item.type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">{item.body}</p>

                  {item.meta?.ticketId ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Ticket #{item.meta.ticketId}
                    </p>
                  ) : null}

                  <p className="mt-3 text-xs text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                  </p>
                </div>

                <CheckCheck className="mt-1 h-5 w-5 text-slate-500" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(nextPage) => loadNotifications(nextPage)}
      />
    </div>
  );
}