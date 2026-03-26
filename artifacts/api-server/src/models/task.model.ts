import { pool } from "@workspace/db";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface TaskWithUser extends Task {
  username: string;
  email: string;
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  const result = await pool.query<Task>(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

export async function getTaskById(id: number, userId: number): Promise<Task | null> {
  const result = await pool.query<Task>(
    "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function createTask(
  userId: number,
  title: string,
  description: string | null,
  status: string = "pending"
): Promise<Task> {
  const result = await pool.query<Task>(
    "INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, title, description, status]
  );
  return result.rows[0];
}

export async function updateTask(
  id: number,
  userId: number,
  title: string,
  description: string | null,
  status: string
): Promise<Task | null> {
  const result = await pool.query<Task>(
    "UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *",
    [title, description, status, id, userId]
  );
  return result.rows[0] || null;
}

export async function deleteTask(id: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getAllTasksAdmin(): Promise<TaskWithUser[]> {
  const result = await pool.query<TaskWithUser>(
    `SELECT t.*, u.username, u.email 
     FROM tasks t 
     JOIN users u ON t.user_id = u.id 
     ORDER BY t.created_at DESC`
  );
  return result.rows;
}
