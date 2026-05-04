import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/index.js";
import { generateToken } from "../utils/jwt.js";
import { googleConfig } from "../config/google.js";

const googleClient = new OAuth2Client(googleConfig.clientId);

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const buildAuthPayload = (user) => ({
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider,
  },
  token: generateToken(user.id),
});

export const authService = {
  async googleLogin(googleCredential) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleCredential,
        audience: googleConfig.clientId,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture, email_verified } = payload;

      if (!email_verified) {
        throw new Error("Google email is not verified");
      }

      const safeEmail = normalizeEmail(email);

      let user = await User.findOne({ where: { googleId } });

      if (!user) {
        user = await User.findOne({ where: { email: safeEmail } });

        if (user) {
          user.googleId = googleId;
          user.authProvider = "GOOGLE";
          user.avatarUrl = picture || user.avatarUrl;
          user.name = name || user.name;
          await user.save();
        } else {
          user = await User.create({
            name,
            email: safeEmail,
            googleId,
            role: "CUSTOMER",
            authProvider: "GOOGLE",
            avatarUrl: picture || null,
          });
        }
      } else {
        user.name = name || user.name;
        user.avatarUrl = picture || user.avatarUrl;
        await user.save();
      }

      return buildAuthPayload(user);
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error("Invalid Google credential");
    }
  },

  async passwordLogin(email, password) {
    const safeEmail = normalizeEmail(email);
    const user = await User.findOne({ where: { email: safeEmail } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      throw new Error("This account uses Google login. Please sign in with Google.");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return buildAuthPayload(user);
  },

  async register(name, email, password) {
    const safeEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ where: { email: safeEmail } });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: safeEmail,
      password: hashedPassword,
      role: "CUSTOMER",
      authProvider: "LOCAL",
      avatarUrl: null,
    });

    return buildAuthPayload(user);
  },

  async getCurrentUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
      },
    };
  },

  async logout() {
    return { message: "Logout successful" };
  },
};