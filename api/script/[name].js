import fs from "fs";
import path from "path";
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const ua = req.headers["user-agent"];
  if (ua !== "MakalHubExecutor") return res.status(403).end("Forbidden");

  const { name, token } = req.query;
  if (!token) return res.status(400).end("Missing token");

  const parts = token.split(":");
  if (parts.length !== 4) return res.status(400).end("Invalid token");
  const [userid, username, expires, sig] = parts;
  if (Date.now() > Number(expires)) return res.status(403).end("Token expired");

  const payload = `${userid}:${username}:${expires}`;
  const expected = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(payload)
    .digest("hex");
  if (sig !== expected) return res.status(403).end("Bad signature");

  const filePath = path.resolve("./scripts", `${name}.lua`);
  if (!fs.existsSync(filePath)) return res.status(404).end("Not found");
  const code = fs.readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(code);
}
