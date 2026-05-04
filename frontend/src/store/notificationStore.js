// store/notificationStore.js
import { create } from "zustand";

const normalizeId = (id) => String(id);
const sortByNewest = (a, b) => {
  const aTime = new Date(a.createdAt || 0).getTime();
  const bTime = new Date(b.createdAt || 0).getTime();
  return bTime - aTime;
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications = []) =>
    set({
      notifications: [...notifications].sort(sortByNewest),
      unreadCount: notifications.filter((item) => !item.isRead).length,
    }),

  setUnreadCount: (count) =>
    set({
      unreadCount: Math.max(0, Number(count) || 0),
    }),

  pushNotification: (notification) =>
    set((state) => {
      if (!notification?.id) return state;

      const nextId = normalizeId(notification.id);
      const existingIndex = state.notifications.findIndex(
        (item) => normalizeId(item.id) === nextId
      );

      let notifications = state.notifications;
      let unreadCount = state.unreadCount;

      if (existingIndex >= 0) {
        const previous = state.notifications[existingIndex];
        const updated = {
          ...previous,
          ...notification,
        };

        notifications = state.notifications.map((item, index) =>
          index === existingIndex ? updated : item
        );

        if (previous.isRead && !updated.isRead) unreadCount += 1;
        if (!previous.isRead && updated.isRead) unreadCount = Math.max(0, unreadCount - 1);
      } else {
        notifications = [notification, ...state.notifications].sort(sortByNewest);
        if (!notification.isRead) unreadCount += 1;
      }

      return {
        notifications,
        unreadCount,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const targetId = normalizeId(id);
      let wasUnread = false;

      const notifications = state.notifications.map((item) => {
        if (normalizeId(item.id) !== targetId) return item;
        if (!item.isRead) wasUnread = true;
        return { ...item, isRead: true };
      });

      return {
        notifications,
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
      unreadCount: 0,
    })),

  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));