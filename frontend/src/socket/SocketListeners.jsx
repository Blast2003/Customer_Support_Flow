// socket/SocketListeners.jsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { getNotificationsApi, markNotificationReadApi } from "../api/notificationApi";
import { useSocket } from "./ContextSocket";
import { useTicketStore } from "../store/ticketStore";
import { useNotificationStore } from "../store/notificationStore";
import { useAuthStore } from "../store/authStore";

function playPingSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.0001;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.21);
  } catch {
    // ignore
  }
}

export default function SocketListeners() {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);

  const addTicket = useTicketStore((state) => state.addTicket);
  const updateTicket = useTicketStore((state) => state.updateTicket);
  const selectedTicketId = useTicketStore((state) => state.selectedTicket?.id);

  const pushNotification = useNotificationStore((state) => state.pushNotification);
  const markNotificationRead = useNotificationStore((state) => state.markAsRead);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  useEffect(() => {
    if (!socket || !socket.connected || !user?.id) return;

    let active = true;

    const syncUnreadCount = async () => {
      try {
        const res = await getNotificationsApi({
          page: 1,
          limit: 1,
          isRead: false,
        });

        const payload = res.data?.data ?? res.data;
        if (!active) return;

        setUnreadCount(Number(payload?.unreadCount ?? payload?.count ?? 0));
      } catch {
        // ignore
      }
    };

    syncUnreadCount();

    return () => {
      active = false;
    };
  }, [socket, user?.id, setUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const onTicketCreated = ({ ticket }) => {
      if (ticket) addTicket(ticket);
    };

    const onTicketUpdated = ({ ticket }) => {
      if (ticket) updateTicket(ticket);
    };

    const onMessageCreated = ({ ticket }) => {
      if (ticket) updateTicket(ticket);

      // Ticket detail page should append message locally when it is open.
      // Keep this handler silent here so it does not duplicate the notification toast.
    };

    const onNotificationCreated = async (payload) => {
      const notifications = Array.isArray(payload?.notifications) && payload.notifications.length
        ? payload.notifications
        : payload?.notification
          ? [payload.notification]
          : payload?.title
            ? [{ ...payload, id: Date.now(), isRead: false }]
            : [];

      for (const item of notifications) {
        if (!item?.id) continue;

        const relatedTicketId = item?.meta?.ticketId;
        const isViewingSameTicket =
          selectedTicketId &&
          relatedTicketId &&
          String(selectedTicketId) === String(relatedTicketId);

        if (isViewingSameTicket && !item.isRead) {
          try {
            await markNotificationReadApi(item.id);
            markNotificationRead(item.id);
          } catch {
            // ignore
          }
          continue;
        }

        pushNotification(item);
        toast(item.title || "New notification", {
          icon: "🔔",
          duration: 2500,
        });
        playPingSound();
      }
    };

    const onComplaintCreated = ({ complaint }) => {
      if (complaint) {
        // UI state only; notification toast comes from notification:created
      }
    };

    const onComplaintUpdated = ({ complaint }) => {
      if (complaint) {
        // UI state only; notification toast comes from notification:created
      }
    };

    const onEscalationCreated = ({ escalation }) => {
      if (escalation) {
        // UI state only; notification toast comes from notification:created
      }
    };

    const onEscalationUpdated = ({ escalation }) => {
      if (escalation) {
        // UI state only; notification toast comes from notification:created
      }
    };

    const onSlaUpdated = ({ ticket } = {}) => {
      if (ticket) updateTicket(ticket);
      // alert comes from notification:created
    };

    const onMessagesSeen = ({ ticketId }) => {
      if (selectedTicketId && String(selectedTicketId) === String(ticketId)) {
        // Optional: update read-receipt UI here
      }
    };

    socket.on("ticket:created", onTicketCreated);
    socket.on("ticket:updated", onTicketUpdated);
    socket.on("ticket:messageCreated", onMessageCreated);
    socket.on("ticket:messagesSeen", onMessagesSeen);
    socket.on("notification:created", onNotificationCreated);
    socket.on("complaint:created", onComplaintCreated);
    socket.on("complaint:updated", onComplaintUpdated);
    socket.on("escalation:created", onEscalationCreated);
    socket.on("escalation:updated", onEscalationUpdated);
    socket.on("sla:updated", onSlaUpdated);

    return () => {
      socket.off("ticket:created", onTicketCreated);
      socket.off("ticket:updated", onTicketUpdated);
      socket.off("ticket:messageCreated", onMessageCreated);
      socket.off("ticket:messagesSeen", onMessagesSeen);
      socket.off("notification:created", onNotificationCreated);
      socket.off("complaint:created", onComplaintCreated);
      socket.off("complaint:updated", onComplaintUpdated);
      socket.off("escalation:created", onEscalationCreated);
      socket.off("escalation:updated", onEscalationUpdated);
      socket.off("sla:updated", onSlaUpdated);
    };
  }, [
    socket,
    addTicket,
    updateTicket,
    selectedTicketId,
    pushNotification,
    markNotificationRead,
  ]);

  return null;
}