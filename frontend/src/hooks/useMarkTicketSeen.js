import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useSocket } from "../socket/ContextSocket";

export default function useMarkTicketSeen(ticketId) {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!socket || !ticketId || !user?.id) return;
    if (!["CUSTOMER", "AGENT"].includes(user.role)) return;

    socket.emit("ticket:markSeen", {
      ticketId: Number(ticketId),
      viewerId: user.id,
      viewerRole: user.role,
    });
  }, [socket, ticketId, user?.id, user?.role]);
}