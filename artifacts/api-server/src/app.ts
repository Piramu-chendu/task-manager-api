import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { swaggerSpec } from "./config/swaggerSpec";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
});

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/", limiter);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec as any));
app.use("/api", router);

const publicPath = path.resolve(__dirname, "../public");
app.use(express.static(publicPath));

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
