import { pool } from "../config/db.js";

// ========================================
// CLIENT MODEL
// Handles all database operations for clients
// ========================================

export const ClientModel = {
  // ========================================
  // GET ALL CLIENTS (with aggregated data)
  // ========================================
  async findAll() {
    const [clients] = await pool.query(`
      SELECT 
        c.client_id,
        u.user_name,
        c.username,
        c.avatar,
        c.base_price,
        c.status,
        c.created_at,
        c.tiktok_link,
        GROUP_CONCAT(DISTINCT n.niche_name SEPARATOR ', ') AS niche,
        COUNT(DISTINCT cc.campaign_id) AS activeCampaigns
      FROM clients c
      INNER JOIN users u ON c.user_id = u.user_id
      LEFT JOIN client_niches cn ON c.client_id = cn.client_id
      LEFT JOIN niches n ON cn.niche_id = n.niche_id
      LEFT JOIN client_campaigns cc ON c.client_id = cc.client_id
      LEFT JOIN campaigns camp ON cc.campaign_id = camp.campaign_id AND camp.status = 'active'
      GROUP BY c.client_id, u.user_name, c.username, c.avatar, c.base_price, c.status, c.created_at, c.tiktok_link
      ORDER BY c.created_at DESC
    `);
    return clients;
  },

  // ========================================
  // GET CLIENT BY ID
  // ========================================
  async findById(clientId) {
    const [rows] = await pool.query(
      `SELECT c.*, u.user_name 
       FROM clients c
       INNER JOIN users u ON c.user_id = u.user_id
       WHERE c.client_id = ?`,
      [clientId]
    );
    return rows[0] || null;
  },

  // ========================================
  // GET CLIENT NICHES
  // ========================================
  async getClientNiches(clientId) {
    const [niches] = await pool.query(
      "SELECT niche_id FROM client_niches WHERE client_id = ?",
      [clientId]
    );
    return niches.map(n => n.niche_id);
  },

  // ========================================
  // GET CLIENT CAMPAIGNS
  // ========================================
  async getClientCampaigns(clientId) {
    const [campaigns] = await pool.query(
      "SELECT campaign_id FROM client_campaigns WHERE client_id = ?",
      [clientId]
    );
    return campaigns.map(c => c.campaign_id);
  },

  // ========================================
  // CREATE CLIENT (with user)
  // ========================================
  async create(clientData, connection) {
    const { user_name, tiktok_link, base_price, username, manager_id } = clientData;

    // Create user first
    const tempEmail = `${username}@temp-client.com`;
    const [userResult] = await connection.query(
      `INSERT INTO users (user_name, email, password, role, is_verified) 
       VALUES (?, ?, ?, 'client', FALSE)`,
      [user_name, tempEmail, 'temp_password_change_later']
    );

    const userId = userResult.insertId;

    // Create client
    const [clientResult] = await connection.query(
      `INSERT INTO clients 
       (user_id, tiktok_link, username, base_price, manager_id, status) 
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [userId, tiktok_link, username, base_price || 0, manager_id || 1]
    );

    return {
      client_id: clientResult.insertId,
      user_id: userId
    };
  },

  // ========================================
  // UPDATE CLIENT
  // ========================================
  async update(clientId, updateData, connection) {
    const { tiktok_link, user_name, base_price, status, username } = updateData;

    // Get user_id
    const [clientRows] = await connection.query(
      "SELECT user_id FROM clients WHERE client_id = ?",
      [clientId]
    );

    if (!clientRows.length) {
      throw new Error("Client not found");
    }

    const userId = clientRows[0].user_id;

    // Update user name
    await connection.query(
      "UPDATE users SET user_name = ? WHERE user_id = ?",
      [user_name, userId]
    );

    // Update client info
    await connection.query(
      `UPDATE clients 
       SET tiktok_link = ?, username = ?, base_price = ?, status = ?
       WHERE client_id = ?`,
      [tiktok_link, username, base_price, status, clientId]
    );

    return true;
  },

  // ========================================
  // UPDATE CLIENT NICHES
  // ========================================
  async updateNiches(clientId, nicheIds, connection) {
    // Delete existing
    await connection.query("DELETE FROM client_niches WHERE client_id = ?", [clientId]);

    // Insert new
    if (nicheIds && nicheIds.length > 0) {
      const values = nicheIds.map(nicheId => [clientId, nicheId]);
      await connection.query(
        "INSERT INTO client_niches (client_id, niche_id) VALUES ?",
        [values]
      );
    }

    return true;
  },

  // ========================================
  // UPDATE CLIENT CAMPAIGNS
  // ========================================
  async updateCampaigns(clientId, campaignIds, connection) {
    // Delete existing
    await connection.query("DELETE FROM client_campaigns WHERE client_id = ?", [clientId]);

    // Insert new
    if (campaignIds && campaignIds.length > 0) {
      const values = campaignIds.map(campaignId => [clientId, campaignId]);
      await connection.query(
        "INSERT INTO client_campaigns (client_id, campaign_id) VALUES ?",
        [values]
      );
    }

    return true;
  },

  // ========================================
  // DELETE CLIENT
  // ========================================
  async delete(clientId, connection) {
    // Get user_id
    const [clientRows] = await connection.query(
      "SELECT user_id FROM clients WHERE client_id = ?",
      [clientId]
    );

    if (!clientRows.length) {
      throw new Error("Client not found");
    }

    const userId = clientRows[0].user_id;

    // Delete client (cascade handles junction tables)
    await connection.query("DELETE FROM clients WHERE client_id = ?", [clientId]);

    // Delete user
    await connection.query("DELETE FROM users WHERE user_id = ?", [userId]);

    return true;
  }
};