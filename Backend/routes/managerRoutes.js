// Backend/routes/managerRoutes.js
import express from "express";
import { verifyManager } from "../middleware/managerMiddleware.js";

const router = express.Router();

// Prefix in app.js: app.use("/manager", managerRoutes)
router.get("/dashboard", verifyManager, (req, res) => {
  res.render("managerDashboard", {
    title: "Manager Dashboard",
    user: req.session.user,
    currentPage: "dashboard",
  });
});

export default router;