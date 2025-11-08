import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Import middleware
import { layoutMiddleware } from "./middleware/layoutMiddleware.js";

// Import routes
import clientRoutes from "./routes/clientRoutes.js";
// TODO: Import other routes
// import nicheRoutes from "./routes/nicheRoutes.js";
// import campaignRoutes from "./routes/campaignRoutes.js";

// ========================================
// CONFIGURATION
// ========================================

// Load environment variables
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// ========================================
// VIEW ENGINE SETUP
// ========================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ========================================
// MIDDLEWARE
// ========================================

// Serve static files (CSS, JS, images) from FrontEnd
app.use(express.static(path.join(__dirname, "../FrontEnd")));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(layoutMiddleware);




// ========================================
// ROUTES
// ========================================

// Client routes
app.use("/app", clientRoutes);

// TODO: Add other routes
// app.use("/app", nicheRoutes);
// app.use("/app", campaignRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Music Marketing Platform!");
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).send("Internal server error");
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Views directory: ${path.join(__dirname, "views")}`);
  console.log(`📁 Static files: ${path.join(__dirname, "../FrontEnd")}`);
});