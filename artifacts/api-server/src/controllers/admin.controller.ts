import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getAllUsers, deleteUserById } from "../models/user.model";
import { getAllTasksAdmin } from "../models/task.model";

export async function listUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users", errors: [String(err)] });
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  const userId = parseInt(req.params["id"] ?? "0", 10);

  try {
    const deleted = await deleteUserById(userId);
    if (!deleted) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete user", errors: [String(err)] });
  }
}

export async function listAllTasks(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const tasks = await getAllTasksAdmin();
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks", errors: [String(err)] });
  }
}
