import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./v1/auth.routes";
import tasksRouter from "./v1/tasks.routes";
import adminRouter from "./v1/admin.routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/v1/auth", authRouter);
router.use("/v1/tasks", tasksRouter);
router.use("/v1/admin", adminRouter);

export default router;
