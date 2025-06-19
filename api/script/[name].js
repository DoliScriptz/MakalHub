import fs from "fs"
import path from "path"
import crypto from "crypto"

export default async function handler(req, res) {
  const ua = req.headers["user-agent"]
  if (ua !== "MakalHubExecutor") return res.status(403).end("Forbidden")

  const { name, token } = req.query
  if (!name || !token) return res.status(400).end("Missing params")

  const expectedHwid = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(`${req.headers["userid"]}:${req.headers["username"]}`)
    .digest("hex")

  const expectedToken = crypto
    .createHmac("sha256", process.env.TOKEN_SECRET)
    .update(expectedHwid)
    .digest("hex")

  if (token !== expectedToken) return res.status(403).end("Invalid token")

  const filePath = path.resolve("./scripts", `${name}.lua`)
  if (!fs.existsSync(filePath)) return res.status(404).end("Script not found")

  const script = fs.readFileSync(filePath, "utf-8")
  res.setHeader("Content-Type", "text/plain")
  res.status(200).end(script)
}
