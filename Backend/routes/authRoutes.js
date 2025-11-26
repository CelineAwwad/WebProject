// Backend/routes/authRoutes.js - REPLACE YOUR managerAuthRoutes.js with this
import express from "express";
import { getLoginPage, loginManager, logoutManager } from "../controllers/managerAuthController.js";
import { getClientLoginPage, loginClient, logoutClient } from "../controllers/clientAuthController.js";
import { blockIfManager } from "../middleware/managerMiddleware.js";
import { blockIfClient } from "../middleware/clientMiddleware.js";

const router = express.Router();

// Manager routes
router.get("/manager/login", blockIfManager, getLoginPage);
router.post("/manager/login", loginManager);
router.get("/manager/logout", logoutManager);

// Client routes
router.get("/client/login", blockIfClient, getClientLoginPage);
router.post("/client/login", loginClient);
router.get("/client/logout", logoutClient);

export default router;