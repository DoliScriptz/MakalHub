import fs from "fs";
import path from "path";
import crypto from "crypto";

export default function handler(req, res) {
  const ua = req.headers["user-agent"];
  if (ua !== "MakalHubExecutor") return res.status(403).end("Forbidden");

  const { name } = req.query;
  const { token } = req.query;
  if (!name || !token) return res.status(400).end("Missing parameters");

  const [userid, username, expires, sig] = token.split(":");
  if (!userid || !username || !expires || !sig) return res.status(400).end("Invalid token format");

  const raw = `${userid}:${username}:${expires}`;
  const validSig = crypto.createHmac("sha256", process.env.HWID_SECRET).update(raw).digest("hex");
  if (sig !== validSig) return res.status(403).end("Invalid signature");

  if (Date.now() > parseInt(expires)) return res.status(403).end("Token expired");

  const filePath = path.resolve("./scripts", `${name}.lua`);
  if (!fs.existsSync(filePath)) return res.status(404).end("Script not found");

  const content = fs.readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(content);
}
