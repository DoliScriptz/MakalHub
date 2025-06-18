import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { name } = req.query;
  const ua = req.headers["user-agent"] || "";
  if (!ua.includes("MakalHubExecutor")) return res.status(403).end();

  const file = path.join(process.cwd(), "secure-scripts", `${name}.lua`);
  if (!fs.existsSync(file)) return res.status(404).end();

  const code = fs.readFileSync(file, "utf8");
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(code);
}
