import { getPayload } from "payload";
import config from "./payload.config.js";
import { createServer } from "node:http";

const PORT = Number(process.env["PORT"] ?? 3002);

async function start() {
  const payload = await getPayload({ config });

  const server = createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  });

  server.listen(PORT, () => {
    payload.logger.info(`CMS server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start CMS:", err);
  process.exit(1);
});
