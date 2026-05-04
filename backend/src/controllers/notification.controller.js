// controllers/notification.controller.js
import * as notificationService from "../services/notification.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.listMyNotifications(
      req.user.id,
      req.query
    );

    const limit = Number(req.query.limit || 10);
    const page = Number(req.query.page || 1);

    res.json(
      responseFormatter.success({
        rows: result.rows,
        count: result.count,
        unreadCount: result.unreadCount,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(result.count / limit)),
      })
    );
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );

    res.json(responseFormatter.success(notification, "Marked as read"));
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json(responseFormatter.success(true, "All notifications marked as read"));
  } catch (err) {
    next(err);
  }
};