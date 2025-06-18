import rateLimit from "@/utils/ratelimit";
import { NextResponse } from "next/server";

const limiter = rateLimit({
  interval: 600000, // 10 minutes
  uniqueTokenPerInterval: 500,
});

export default async function handler(req, res) {
  const agent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Protect from non-allowed User-Agents (like browsers)
  if (!agent.includes("MakalHubExecutor")) {
    return res.status(403).end("Forbidden");
  }

  try {
    await limiter.check(res, 3, ip);
  } catch {
    return res.status(429).end("Rate limit exceeded");
  }

  const name = req.query.name;
  if (!name || !/^[\w\-]+$/.test(name)) {
    return res.status(400).end("Invalid name");
  }

  const url = `https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/scripts/${name}.lua`;
  const response = await fetch(url);
  if (!response.ok) return res.status(404).end("Script not found");

  const script = await response.text();
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(script);
}
