import rateLimit from "@/utils/ratelimit";
import fs from "fs/promises";
import path from "path";

const allowedAgent = "MakalHubExecutor";

export default async function handler(req, res) {
  const { name } = req.query;
  const agent = req.headers["user-agent"] || "";

  if (req.method !== "GET") return res.status(405).end();
  if (!agent.includes(allowedAgent)) return res.status(403).end("Forbidden");

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const { success } = await rateLimit.limit(ip);
  if (!success) return res.status(429).end("Rate limit exceeded");

  try {
    const filePath = path.resolve(process.cwd(), "scripts", `${name}.lua`);
    const script = await fs.readFile(filePath, "utf8");

    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(script);
  } catch {
    return res.status(404).end("Script not found");
  }
}
