export default async function handler(req, res) {
  const ua = req.headers['user-agent'] || '';
  if (!ua.includes("MakalHubExecutor")) return res.status(403).end("Forbidden");

  const name = req.query.name;
  if (!name || typeof name !== "string") return res.status(400).end("Missing script name");

  const url = `https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/scripts/${name}.lua`;

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(404).end("Script not found");

    const script = await response.text();
    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(script);
  } catch {
    return res.status(500).end("Internal error");
  }
}
