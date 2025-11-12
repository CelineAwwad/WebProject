import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

async function hashPasswords() {
  try {
    console.log("🔄 Checking users with un-hashed passwords...");

    // Fetch all users (you can limit to managers only if you want)
    const [users] = await pool.execute("SELECT user_id, password FROM users");

    for (const user of users) {
      const password = user.password;

      // bcrypt hashes always start with "$2" — if not, it’s plaintext
      if (!password.startsWith("$2")) {
        const hashed = await bcrypt.hash(password, 10);

        await pool.execute(
          "UPDATE users SET password = ? WHERE user_id = ?",
          [hashed, user.user_id]
        );

        console.log(`✅ Password hashed for user_id: ${user.user_id}`);
      }
    }

    console.log("🎉 Done! All plaintext passwords have been hashed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error hashing passwords:", err);
    process.exit(1);
  }
}

hashPasswords();
