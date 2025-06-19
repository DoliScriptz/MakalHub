import fs from "fs"
import path from "path"
import crypto from "crypto"

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end()

  const ua = req.headers["user-agent"]
  if (ua !== "MakalHubExecutor") return res.status(403).end("Forbidden")

  const { name, token } = req.query
  if (!name || !token) return res.status(400).end("Missing")

  const parts = token.split(":")
  if (parts.length !== 4) return res.status(400).end("Malformed token")

  const [userid, username, expires, sig] = parts
  if (Date.now() > parseInt(expires, 10)) return res.status(403).end("Token expired")

  const expected = crypto.createHmac("sha256", process.env.HWID_SECRET)
    .update(`${userid}:${username}:${expires}`)
    .digest("hex")

  if (sig !== expected) return res.status(403).end("Invalid token")

  const filePath = path.resolve("scripts", `${name}.lua`)
  if (!fs.existsSync(filePath)) return res.status(404).end("Script not found")

  const script = fs.readFileSync(filePath, "utf8")
  res.setHeader("Content-Type", "text/plain")
  res.status(200).send(script)
}
