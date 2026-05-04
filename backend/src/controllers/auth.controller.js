import { authService } from "../services/auth.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";

export const authController = {
  async googleLogin(req, res) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ message: "Google credential is required" });
      }

      const result = await authService.googleLogin(credential);

      return res
        .status(200)
        .json(responseFormatter.success(result, "Google login successful"));
    } catch (error) {
      console.error("Google login controller error:", error);
      return res.status(401).json({
        message: error.message || "Google login failed",
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await authService.passwordLogin(email, password);

      return res
        .status(200)
        .json(responseFormatter.success(result, "Login successful"));
    } catch (error) {
      console.error("Login controller error:", error);
      return res.status(401).json({
        message: error.message || "Login failed",
      });
    }
  },

  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email, and password are required",
        });
      }

      const result = await authService.register(name, email, password);

      return res
        .status(201)
        .json(responseFormatter.success(result, "Registration successful"));
    } catch (error) {
      console.error("Register controller error:", error);
      return res.status(400).json({
        message: error.message || "Registration failed",
      });
    }
  },

  async me(req, res) {
    try {
      const result = await authService.getCurrentUser(req.userId);

      return res
        .status(200)
        .json(responseFormatter.success(result, "Current user fetched"));
    } catch (error) {
      console.error("Me controller error:", error);
      return res.status(404).json({
        message: error.message || "User not found",
      });
    }
  },

  async logout(req, res) {
    try {
      const result = await authService.logout(req.userId);

      return res
        .status(200)
        .json(responseFormatter.success(result, "Logout successful"));
    } catch (error) {
      console.error("Logout controller error:", error);
      return res.status(500).json({
        message: error.message || "Logout failed",
      });
    }
  },
};