import { Server } from "socket.io";
import { registerTicketSocketEvents } from "./ticket.socket.js";

let ioInstance = null;
const userSocketMap = {};

const normalizeUserId = (userId) => (userId == null ? null : String(userId));

export const getRecipientSocketId = (userId) => userSocketMap[normalizeUserId(userId)];

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;

  const socketId = userSocketMap[normalizeUserId(userId)];
  if (socketId) {
    ioInstance.to(socketId).emit(event, payload);
  }
};

export const emitToUsers = (userIds = [], event, payload) => {
  [...new Set(userIds.filter(Boolean).map(String))].forEach((userId) =>
    emitToUser(userId, event, payload)
  );
};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "https://customer-support-flow.onrender.com",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap[String(userId)] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    registerTicketSocketEvents({ io, socket, userSocketMap });

    socket.on("disconnect", () => {
      if (userId && userId !== "undefined") {
        delete userSocketMap[String(userId)];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};