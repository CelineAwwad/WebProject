import { pool } from "../config/db.js";

export const getAllClients = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT client_id, client_name AS name, contact_info FROM clients ORDER BY client_id DESC"
    );
    res.render("clients", { clients: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
};

export const getClientById = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM clients WHERE client_id = ?", [id]);
    if (!rows.length) return res.status(404).send("Not found");
    res.render("client-detail", { client: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
};

export const createClient = async (req,res) => {
  try {
      
     // Step 1: Get the form data the user submitted
    const { client_name, contact_info, manager_id } = req.body;

    // Step 2: Validate it (make sure it’s not empty)
    if (!client_name || !manager_id) {
      return res.status(400).send("Client name and manager ID are required");
    }

    // Step 3: Insert into the database
    await pool.query(
      "INSERT INTO clients (client_name, contact_info, manager_id) VALUES (?, ?, ?)",
      [client_name, contact_info || null, manager_id]
    );

    // Step 4: Redirect back to the clients list
    res.redirect("/app/clients");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};