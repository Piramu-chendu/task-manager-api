import { Router } from "express";
import { body } from "express-validator";
import { authenticateToken } from "../../middleware/auth";
import { handleValidation } from "../../middleware/validate";
import {
  getTasks,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from "../../controllers/tasks.controller";

const router = Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /v1/tasks:
 *   get:
 *     summary: Get all tasks for logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get("/", getTasks as any);

/**
 * @swagger
 * /v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("status")
      .optional()
      .isIn(["pending", "in_progress", "done"])
      .withMessage("Status must be pending, in_progress, or done"),
  ],
  handleValidation,
  createTaskHandler as any
);

/**
 * @swagger
 * /v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
router.put(
  "/:id",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("status")
      .optional()
      .isIn(["pending", "in_progress", "done"])
      .withMessage("Status must be pending, in_progress, or done"),
  ],
  handleValidation,
  updateTaskHandler as any
);

/**
 * @swagger
 * /v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete("/:id", deleteTaskHandler as any);

export default router;
