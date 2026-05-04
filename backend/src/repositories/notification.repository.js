// repositories/notification.repository.js
import { Notification } from "../models/index.js";

export const findNotificationsForUser = async (
  userId,
  { limit = 10, offset = 0, isRead } = {}
) => {
  const where = { userId };

  if (typeof isRead === "boolean") {
    where.isRead = isRead;
  }

  return Notification.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

export const countUnreadNotifications = async (userId) => {
  return Notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

export const createNotification = async (data) => {
  return Notification.create(data);
};

export const markNotificationRead = async (id, userId) => {
  const notification = await Notification.findOne({
    where: { id, userId },
  });

  if (!notification) return null;

  if (!notification.isRead) {
    await notification.update({ isRead: true });
  }

  return notification;
};

export const markAllNotificationsRead = async (userId) => {
  return Notification.update(
    { isRead: true },
    {
      where: {
        userId,
        isRead: false,
      },
    }
  );
};