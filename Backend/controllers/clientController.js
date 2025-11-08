import { pool } from "../config/db.js";
//
import { ClientModel } from "../models/ClientModel.js";

//import { ClientModel } from "../models/ClientModel.js";

// ========================================
// 📋 GET ALL CLIENTS (for main page)
// ========================================
export const getAllClients = async (req, res) => {
  try {
    const clients = await ClientModel.findAll();
    
    res.render("clients", { 
      clients,
      currentPage: 'clients',
      pageTitle: 'Clients · Music Marketing Platform',
      layout: 'layout'
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).send("Database error");
  }
};

// ========================================
// 👁️ GET CLIENT DETAILS (for view modal)
// ========================================
export const getClientDetails = async (req, res) => {
  const clientId = req.params.id;
  
  try {
    const client = await ClientModel.findById(clientId);
    
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const clientNiches = await ClientModel.getClientNiches(clientId);
    const clientCampaigns = await ClientModel.getClientCampaigns(clientId);

    const [allNiches] = await pool.query("SELECT * FROM niches ORDER BY niche_name");
    const [allCampaigns] = await pool.query(
      "SELECT * FROM campaigns WHERE status = 'active' ORDER BY title"
    );

    res.json({
      client,
      clientNiches,
      clientCampaigns,
      allNiches,
      allCampaigns,
    });
  } catch (err) {
    console.error("Error fetching client details:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ========================================
// ➕ CREATE CLIENT
// ========================================
export const createClient = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { user_name, tiktok_link, base_price, username, manager_id } = req.body;

    if (!user_name || !tiktok_link || !username) {
      return res.status(400).json({ 
        error: "Client name, TikTok link, and username are required" 
      });
    }

    await connection.beginTransaction();

    const result = await ClientModel.create(req.body, connection);

    await connection.commit();

    res.status(201).json({ 
      success: true, 
      ...result
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error creating client:", err);
    res.status(500).json({ error: "Database error: " + err.message });
  } finally {
    connection.release();
  }
};

// ========================================
// 📝 UPDATE CLIENT
// ========================================
export const updateClient = async (req, res) => {
  const clientId = req.params.id;
  const connection = await pool.getConnection();
  
  try {
    const { niches, campaigns, ...clientData } = req.body;

    await connection.beginTransaction();

    // Update client basic info
    await ClientModel.update(clientId, clientData, connection);

    // Update niches if provided
    if (niches !== undefined) {
      await ClientModel.updateNiches(clientId, niches, connection);
    }

    // Update campaigns if provided
    if (campaigns !== undefined) {
      await ClientModel.updateCampaigns(clientId, campaigns, connection);
    }

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating client:", err);
    res.status(500).json({ error: "Database error: " + err.message });
  } finally {
    connection.release();
  }
};

// ========================================
// 🗑️ DELETE CLIENT
// ========================================
export const deleteClient = async (req, res) => {
  const clientId = req.params.id;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    await ClientModel.delete(clientId, connection);

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting client:", err);
    res.status(500).json({ error: "Database error: " + err.message });
  } finally {
    connection.release();
  }
};