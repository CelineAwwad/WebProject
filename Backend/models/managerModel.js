// Backend/models/managerModel.js
import { pool } from "../config/db.js";

/**
 * Returns the manager user row (includes hashed password)
 * Columns needed later: user_id, user_name, email, password, role
 */
export const findManagerByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT user_id, user_name, email, password, role
     FROM users
     WHERE email = ? AND role = 'manager'
     LIMIT 1`,
    [email]
  );
  return rows[0];
};