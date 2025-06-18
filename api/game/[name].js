import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { name } = req.query;

  const ua = req.headers["user-agent"] || "";
  if (!ua.includes("MakalHubExecutor")) return res.status(403).end("Forbidden");

  const filePath = path.join(process.cwd(), "secure-scripts", `${name}.lua`);
  if (!fs.existsSync(filePath)) return res.status(404).end("Script not found");

  const content = fs.readFileSync(filePath, "utf8");
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(content);
}
