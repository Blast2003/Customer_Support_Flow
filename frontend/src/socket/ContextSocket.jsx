import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const existingSocket = socketRef.current;

    if (!token || !user?.id) {
      if (existingSocket) {
        existingSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      }

      clearNotifications();
      return;
    }

    if (existingSocket) {
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin || "http://localhost:5100";

    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      auth: {
        token,
      },
      query: {
        userId: user.id,
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [token, user?.id, clearNotifications]);

  const value = useMemo(() => ({ socket }), [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
}