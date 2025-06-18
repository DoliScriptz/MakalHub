import rateLimit from "@/utils/ratelimit";

const allowUserAgent = "MakalHubExecutor";

const githubBase = "https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/scripts/";

export default async function handler(req, res) {
  const { name } = req.query;
  const agent = req.headers["user-agent"] || "";

  if (req.method !== "GET") return res.status(405).end();
  if (!agent.includes(allowUserAgent)) return res.status(403).end("Forbidden");

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const { success } = await rateLimit.limit(ip);
  if (!success) return res.status(429).end("Rate limit exceeded");

  const response = await fetch(githubBase + name + ".lua");
  if (!response.ok) return res.status(404).end("Script not found");

  const script = await response.text();
  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(script);
}
