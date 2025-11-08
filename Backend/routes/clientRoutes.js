import express from "express";
import {
  getAllClients,
  getClientDetails,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router();

// Get all clients (main page)
router.get("/clients", getAllClients);

// Get client details (for view modal)
router.get("/clients/:id/details", getClientDetails);

// Create new client
router.post("/clients", createClient);

// Update client
router.put("/clients/:id", updateClient);

// Delete client
router.delete("/clients/:id", deleteClient);

export default router;