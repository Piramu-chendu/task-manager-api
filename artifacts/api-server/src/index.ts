import app from "./app";
import { logger } from "./lib/logger";

const port = parseInt(process.env["PORT"] || "3000", 10);

app.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, `Server listening on port ${port}`);
});
