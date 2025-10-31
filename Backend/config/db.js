// Backend/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "user123",
  database: process.env.DB_NAME || "music_marketing",
  waitForConnections: true,
  connectionLimit: 10,
});
