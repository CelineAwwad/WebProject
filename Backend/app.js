import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import clientRoutes from "./routes/clientRoutes.js";

// Load .env file
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, JS, images) from FrontEnd
app.use(express.static(path.join(__dirname, "../FrontEnd")));

// Parse form data (optional for POST later)
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/app", clientRoutes);

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Welcome to the Music Marketing Platform!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
