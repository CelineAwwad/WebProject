// Backend/controllers/managerAuthController.js
import bcrypt from "bcryptjs";
import { findManagerByEmail } from "../models/managerModel.js";

// (optional) reusable helper
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const getLoginPage = (req, res) => {
  try {
    // If already logged-in as manager, go to dashboard
    if (req.session?.user?.role === "manager") {
      return res.redirect("/manager/dashboard");
    }
    res.render("auth/managerLogin", {
      title: "Manager Login",
      currentPage: "managerLogin",
      error: null,
      email: "", // prefill field on first load
    });
  } catch (err) {
    console.error("Error rendering login page:", err);
    res.status(500).send("Server error");
  }
};

export const loginManager = async (req, res) => {
  try {
    let { email = "", password = "" } = req.body;
    email = String(email).trim().toLowerCase();
    password = String(password);

    if (!email || !password) {
      return res.render("auth/managerLogin", {
        title: "Manager Login",
        currentPage: "managerLogin",
        error: "Please provide both email and password.",
        email,
      });
    }
    if (!isValidEmail(email)) {
      return res.render("auth/managerLogin", {
        title: "Manager Login",
        currentPage: "managerLogin",
        error: "Please enter a valid email.",
        email,
      });
    }

    const manager = await findManagerByEmail(email);
    // Use a single generic error for user-not-found or bad password
    const genericError = {
      title: "Manager Login",
      currentPage: "managerLogin",
      error: "Invalid credentials. Please try again.",
      email,
    };

    if (!manager?.password) {
      return res.status(401).render("auth/managerLogin", genericError);
    }

    const ok = await bcrypt.compare(password, manager.password);
    if (!ok) {
      return res.status(401).render("auth/managerLogin", genericError);
    }

    // Prevent session fixation: regenerate before setting user
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("Session regenerate error:", regenErr);
        return res
          .status(500)
          .render("auth/managerLogin", { ...genericError, error: "Login failed. Please try again." });
      }

      req.session.user = {
        id: manager.user_id,
        name: manager.user_name,
        email: manager.email,
        role: manager.role, // 'manager'
      };

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res
            .status(500)
            .render("auth/managerLogin", { ...genericError, error: "Login failed. Please try again." });
        }
        return res.redirect("/manager/dashboard");
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("auth/managerLogin", {
      title: "Manager Login",
      currentPage: "managerLogin",
      error: "Something went wrong. Please try again.",
      email: req.body?.email || "",
    });
  }
};

export const logoutManager = (req, res) => {
  // destroy then clear cookie
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.clearCookie("connect.sid");
    res.redirect("/auth/manager/login");
 });
};
