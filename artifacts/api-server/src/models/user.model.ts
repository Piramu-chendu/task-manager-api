import { pool } from "@workspace/db";

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
  role: string = "user"
): Promise<{ id: number }> {
  const result = await pool.query<{ id: number }>(
    "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
    [username, email, passwordHash, role]
  );
  return result.rows[0];
}

export async function getAllUsers(): Promise<Omit<User, "password_hash">[]> {
  const result = await pool.query<Omit<User, "password_hash">>(
    "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function deleteUserById(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
