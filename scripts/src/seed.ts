import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";

async function seed() {
  console.log("Creating tables...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("Tables created.");

  const passwordHash = await bcrypt.hash("admin123", 10);

  const existing = await pool.query("SELECT id FROM users WHERE email = 'admin@app.com'");
  if (existing.rows.length === 0) {
    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      ["admin", "admin@app.com", passwordHash, "admin"]
    );
    console.log("Admin user created: admin@app.com / admin123");
  } else {
    console.log("Admin user already exists.");
  }

  await pool.end();
  console.log("Seed complete!");
}

seed().catch(err => { console.error(err); process.exit(1); });
