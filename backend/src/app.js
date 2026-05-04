import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";

const app = express();

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com"
        ],
        scriptSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com"
        ],
        styleSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com"
        ],

        frameSrc: [
          "'self'",
          "https://accounts.google.com"
        ],

        connectSrc: [
          "'self'",
          "https://accounts.google.com"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://images.unsplash.com",
          "https://res.cloudinary.com",
          "https://global.discourse-cdn.com"
        ],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://customer-support-flow.onrender.com",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/api", routes);


app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;