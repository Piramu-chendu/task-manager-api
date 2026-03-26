import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../models/task.model";

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tasks = await getTasksByUserId(req.user!.id);
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks", errors: [String(err)] });
  }
}

export async function createTaskHandler(req: AuthRequest, res: Response): Promise<void> {
  const { title, description, status } = req.body as {
    title: string;
    description?: string;
    status?: string;
  };

  try {
    const task = await createTask(req.user!.id, title, description ?? null, status ?? "pending");
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create task", errors: [String(err)] });
  }
}

export async function updateTaskHandler(req: AuthRequest, res: Response): Promise<void> {
  const taskId = parseInt(req.params["id"] ?? "0", 10);
  const { title, description, status } = req.body as {
    title: string;
    description?: string;
    status?: string;
  };

  try {
    const task = await updateTask(taskId, req.user!.id, title, description ?? null, status ?? "pending");
    if (!task) {
      res.status(404).json({ success: false, message: "Task not found or not authorized" });
      return;
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update task", errors: [String(err)] });
  }
}

export async function deleteTaskHandler(req: AuthRequest, res: Response): Promise<void> {
  const taskId = parseInt(req.params["id"] ?? "0", 10);

  try {
    const deleted = await deleteTask(taskId, req.user!.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Task not found or not authorized" });
      return;
    }
    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete task", errors: [String(err)] });
  }
}
