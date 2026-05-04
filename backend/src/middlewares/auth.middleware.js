import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // optional fallback if you ever move to cookies later
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
}

function extractUserId(decoded) {
  return decoded?.id ?? decoded?._id ?? decoded?.userId ?? decoded?.sub ?? null;
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = extractUserId(decoded);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role", "avatarUrl", "authProvider"],
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user.get({ plain: true });
    req.auth = decoded;
    next();
  } catch (error) {
    console.error("authMiddleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};