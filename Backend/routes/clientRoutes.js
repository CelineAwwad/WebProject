// Backend/routes/clientRoutes.js - NEW FILE
import express from "express";
import { verifyClient } from "../middleware/clientMiddleware.js";
import {
  getClientProfile,
  updateAvatar,
  changePassword,
  upload,
} from "../controllers/clientProfileController.js";

const router = express.Router();

// Client dashboard
router.get("/dashboard", verifyClient, (req, res) => {
  res.render("client/dashboard", {
    title: "Client Dashboard",
    user: req.session.user,
    currentPage: "dashboard",
  });
});

// Profile routes
router.get("/profile", verifyClient, getClientProfile);
router.post("/profile/avatar", verifyClient, upload.single("avatar"), updateAvatar);
router.post("/profile/change-password", verifyClient, changePassword);

export default router;