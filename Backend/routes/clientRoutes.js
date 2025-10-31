import express from "express";
import { getAllClients, getClientById,createClient } from "../controllers/clientController.js";
const router = express.Router();

router.get("/clients", getAllClients);
router.get("/clients/:id", getClientById);
router.post("/clients",createClient);

export default router;
