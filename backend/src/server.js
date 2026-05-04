import dotenv from "dotenv";
import http from "http";
import path from "path";
import express from "express";
import app from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { initSocket } from "./sockets/socket.js";
import { startSlaMonitor } from "./jobs/slaMonitor.js";

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 5100;

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "frontend", "dist");

  app.use(express.static(frontendDistPath));

  // Serve React app for all non-API routes
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectToDatabase();
    console.log("Database connected");

    const server = http.createServer(app);

    initSocket(server);
    startSlaMonitor();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();