// Backend/controllers/clientAuthController.js
import bcrypt from "bcryptjs";
import { findClientByUsername } from "../models/ClientModel.js";

export const getClientLoginPage = (req, res) => {
  try {
    // If already logged in as client, redirect to dashboard
    if (req.session?.user?.role === "client") {
      return res.redirect("/client/dashboard");
    }
    res.render("auth/clientLogin", {
      title: "Client Login",
      currentPage: "clientLogin",
      layout: false, // No sidebar for login page
      error: null,
      username: "",
    });
  } catch (err) {
    console.error("Error rendering client login page:", err);
    res.status(500).send("Server error");
  }
};

export const loginClient = async (req, res) => {
  try {
    let { username = "", password = "" } = req.body;
    username = String(username).trim();
    password = String(password);

    if (!username || !password) {
      return res.render("auth/clientLogin", {
        title: "Client Login",
        currentPage: "clientLogin",
        layout: false,
        error: "Please provide both username and password.",
        username,
      });
    }

    const client = await findClientByUsername(username);
    const genericError = {
      title: "Client Login",
      currentPage: "clientLogin",
      layout: false,
      error: "Invalid credentials. Please try again.",
      username,
    };

    if (!client?.password) {
      return res.status(401).render("auth/clientLogin", genericError);
    }

    const ok = await bcrypt.compare(password, client.password);
    if (!ok) {
      return res.status(401).render("auth/clientLogin", genericError);
    }

    // Regenerate session to prevent fixation
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("Session regenerate error:", regenErr);
        return res.status(500).render("auth/clientLogin", {
          ...genericError,
          error: "Login failed. Please try again.",
        });
      }

      req.session.user = {
        id: client.user_id,
        name: client.user_name,
        username: client.username,
        email: client.email,
        role: client.role,
        client_id: client.client_id,
        avatar: client.avatar,
      };

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res.status(500).render("auth/clientLogin", {
            ...genericError,
            error: "Login failed. Please try again.",
          });
        }
        return res.redirect("/client/dashboard");
      });
    });
  } catch (err) {
    console.error("Client login error:", err);
    res.status(500).render("auth/clientLogin", {
      title: "Client Login",
      currentPage: "clientLogin",
      layout: false,
      error: "Something went wrong. Please try again.",
      username: req.body?.username || "",
    });
  }
};

export const logoutClient = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.clearCookie("connect.sid");
    res.redirect("/auth/client/login");
  });
};