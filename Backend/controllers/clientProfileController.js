// Backend/controllers/clientProfileController.js
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import multer from "multer";
import path from "path";

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "FrontEnd/uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Get client profile page
export const getClientProfile = async (req, res) => {
  try {
    const clientId = req.session.user.client_id;

    const [rows] = await pool.query(
      `SELECT c.*, u.user_name, u.email 
       FROM clients c
       INNER JOIN users u ON c.user_id = u.user_id
       WHERE c.client_id = ?`,
      [clientId]
    );

    if (!rows.length) {
      return res.status(404).send("Profile not found");
    }

    const client = rows[0];

    res.render("client/profile", {
      title: "My Profile",
      currentPage: "profile",
      user: req.session.user,
      client,
    });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Server error");
  }
};

// Update avatar
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const clientId = req.session.user.client_id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    await pool.query("UPDATE clients SET avatar = ? WHERE client_id = ?", [
      avatarPath,
      clientId,
    ]);

    // Update session
    req.session.user.avatar = avatarPath;

    res.json({ success: true, avatar: avatarPath });
  } catch (err) {
    console.error("Error updating avatar:", err);
    res.status(500).json({ error: "Failed to update avatar" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    // Get current password
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};