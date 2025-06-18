export default async function handler(req, res) {
  const allowedUA = "MakalHubExecutor"
  const userAgent = req.headers["user-agent"]

  if (userAgent !== allowedUA) {
    return res.status(403).send("Access denied")
  }

  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed")
  }

  const fs = require("fs")
  const path = require("path")

  const filePath = path.join(process.cwd(), "secure-scripts", "babft.lua")

  try {
    const data = fs.readFileSync(filePath, "utf8")
    res.setHeader("Content-Type", "text/plain")
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send("Error loading script")
  }
}
