import { User } from "../models/index.js";
import * as notifRepo from "../repositories/notification.repository.js";
import { emitToUser } from "../sockets/socket.js";
import { getPagination } from "../utils/pagination.js";

const normalizeIds = (ids = []) =>
  [...new Set((ids || []).filter(Boolean).map(String))];

const parseBooleanQuery = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value).toLowerCase() === "true";
};

export const listMyNotifications = async (userId, query = {}) => {
  const { limit, offset } = getPagination(query);
  const isRead = parseBooleanQuery(query.isRead);

  const [result, unreadCount] = await Promise.all([
    notifRepo.findNotificationsForUser(userId, {
      limit,
      offset,
      isRead,
    }),
    notifRepo.countUnreadNotifications(userId),
  ]);

  return {
    ...result,
    unreadCount,
  };
};

export const notifyUsers = async (userIds, payload) => {
  const validUserIds = normalizeIds(userIds);
  if (!validUserIds.length) return [];

  const notifications = [];

  for (const userId of validUserIds) {
    const created = await notifRepo.createNotification({
      userId,
      title: payload.title,
      body: payload.body,
      type: payload.type || "INFO",
      isRead: false,
      meta: payload.meta || null,
    });

    const plain = created.get({ plain: true });
    notifications.push(plain);

    emitToUser(userId, "notification:created", {
      notification: plain,
      notifications: [plain],
      title: plain.title,
      body: plain.body,
      type: plain.type,
      meta: plain.meta,
    });
  }

  return notifications;
};

export const notifyAdmins = async (payload, options = {}) => {
  const exclude = normalizeIds(options.excludeUserIds || []);

  const admins = await User.findAll({
    where: { role: "ADMIN" },
    attributes: ["id"],
  });

  const adminIds = admins
    .map((admin) => admin.id)
    .filter((id) => !exclude.includes(String(id)));

  return notifyUsers(adminIds, payload);
};

export const markAsRead = async (id, userId) => {
  const notification = await notifRepo.markNotificationRead(id, userId);

  if (!notification) {
    throw Object.assign(new Error("Notification not found"), { status: 404 });
  }

  return notification.get({ plain: true });
};

export const markAllAsRead = async (userId) => {
  await notifRepo.markAllNotificationsRead(userId);
  return true;
};