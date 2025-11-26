// Backend/app.js - CORRECT VERSION WITH PROPER IMPORTS
import express from "express";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import fs from "fs";

// ========================================
// MIDDLEWARE IMPORTS - ONE LEVEL UP (../)
// ========================================
import { layoutMiddleware } from "./middleware/layoutMiddleware.js";
import { verifyManager } from "./middleware/managerMiddleware.js";

// ========================================
// ROUTE IMPORTS - ONE LEVEL UP (../)
// ========================================
import authRoutes from "./routes/authRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";

// ❌ DO NOT import controllers directly in app.js!
// Controllers should only be imported in route files

// ========================================
// BASIC SETUP
// ========================================
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../FrontEnd/uploads/avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads/avatars directory");
}

// ========================================
// VIEW ENGINE
// ========================================
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// ========================================
// STATIC + BODY PARSERS
// ========================================
app.use(express.static(path.join(__dirname, "../FrontEnd")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// SESSION SETUP
// ========================================
try {
  const MySQLStore = MySQLStoreFactory(session);
  const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "user123",
    database: process.env.DB_NAME || "music_marketing",
  });

  app.use(
    session({
      key: "user_session",
      secret: process.env.SESSION_SECRET || "fallback-secret",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      },
    })
  );
  console.log("✅ Session store initialized");
} catch (err) {
  console.error("❌ SESSION INIT ERROR:", err);
}

// Layout middleware AFTER sessions
app.use(layoutMiddleware);

// ========================================
// ROUTES - NO CONTROLLER IMPORTS HERE!
// ========================================

// Auth routes (both manager and client login/logout)
app.use("/auth", authRoutes);

// Manager routes (dashboard)
app.use("/manager", managerRoutes);

// Client routes (dashboard, profile)
app.use("/client", clientRoutes);

// App routes (manager's pages: clients, campaigns, niches) - PROTECTED
app.use("/app", verifyManager, appRoutes);

// Root redirect - smart routing based on role
app.get("/", (req, res) => {
  if (req.session?.user?.role === "manager") {
    return res.redirect("/manager/dashboard");
  } else if (req.session?.user?.role === "client") {
    return res.redirect("/client/dashboard");
  }
  res.redirect("/auth/manager/login");
});

// ========================================
// ERROR HANDLING
// ========================================
app.use((req, res) => {
  res.status(404).send(`
    <h2>404 - Page Not Found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go Home</a>
  `);
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  const msg = err && err.message ? err.message : "Unknown internal error";
  res.status(500).send(`
    <h2 style="color:red;">500 - Internal Server Error</h2>
    <pre>${msg}</pre>
    <p><a href="/">Go Home</a></p>
  `);
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🎵 Music Marketing Platform               ║
║                                            ║
║  Server: http://localhost:${PORT}           ║
║  Manager: /auth/manager/login              ║
║  Client:  /auth/client/login               ║
╚════════════════════════════════════════════╝
  `);
});
