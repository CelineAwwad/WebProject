import express from "express";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";

// Middleware + Routes
import { layoutMiddleware } from "./middleware/layoutMiddleware.js";
import managerAuthRoutes from "./routes/managerAuthRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";

// ========================================
// BASIC SETUP
// ========================================
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
// SESSION SETUP (robust version)
// ========================================
try {
  const MySQLStore = MySQLStoreFactory(session);
  const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "test",
  });

  app.use(
    session({
      key: "user_session",
      secret: process.env.SESSION_SECRET || "fallback-secret",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true },
    })
  );
} catch (err) {
  console.error("SESSION INIT ERROR:", err);
}

// Move layoutMiddleware after sessions
app.use(layoutMiddleware);

// ========================================
// ROUTES (wrapped to prevent silent crash)
// ========================================
function safeRoute(prefix, router) {
  try {
    app.use(prefix, router);
  } catch (e) {
    app.get(prefix + "*", (req, res) => {
      res
        .status(500)
        .send(`<h2>Route error at ${prefix}</h2><pre>${e.message}</pre>`);
    });
  }
}

safeRoute("/auth", managerAuthRoutes);
safeRoute("/manager", managerRoutes);
safeRoute("/app", clientRoutes);

app.get("/", (req, res) => res.redirect("/auth/manager/login"));

// ========================================
// ERROR HANDLING (renders visible HTML instead of silent error)
// ========================================
app.use((req, res) => {
  res.status(404).send("<h2>404 - Page Not Found</h2>");
});

app.use((err, req, res, next) => {
  const msg =
    err && err.message
      ? err.message
      : "Unknown internal error (check EJS includes or session setup)";
  res
    .status(500)
    .send(`<h2 style="color:red;">500 - Internal Server Error</h2><pre>${msg}</pre>`);
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Running → http://localhost:${PORT}`);
});
