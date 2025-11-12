// Backend/routes/managerAuthRoutes.js
import express from "express";
import { getLoginPage, loginManager, logoutManager } from "../controllers/managerAuthController.js";
import { blockIfManager } from "../middleware/managerMiddleware.js";

const router = express.Router();

// Prefix in app.js should be: app.use("/auth", managerAuthRoutes)
router.get("/manager/login", blockIfManager, getLoginPage);
router.post("/manager/login", loginManager);
router.get("/manager/logout", logoutManager);

export default router;