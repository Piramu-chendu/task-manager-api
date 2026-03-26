import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/roleCheck";
import { listUsers, deleteUser, listAllTasks } from "../../controllers/admin.controller";

const router = Router();

router.use(authenticateToken as any);
router.use(requireAdmin as any);

/**
 * @swagger
 * /v1/admin/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/users", listUsers as any);

/**
 * @swagger
 * /v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
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
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", deleteUser as any);

/**
 * @swagger
 * /v1/admin/tasks:
 *   get:
 *     summary: List all tasks across all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/tasks", listAllTasks as any);

export default router;
