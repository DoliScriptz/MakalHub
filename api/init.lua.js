import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const key = req.query.key;
  if (!key) return res.status(403).send("-- Forbidden");

  const raw = key.match(/../g).map(h => String.fromCharCode(parseInt(h, 16) ^ 0xAA)).join("");
  const [hwid, userid] = raw.split(":");
  if (!hwid || !userid) return res.status(403).send("-- Invalid HWID");

  const owner = "DoliScriptz";
  const repo = "MakalHub";
  const path = "hwids.json";
  const token = process.env.GITHUB_TOKEN;

  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
  const json = await resp.json();
  const db = JSON.parse(Buffer.from(json.content, "base64").toString());
  const user = db.users?.[hwid];

  if (!user || String(user.userid) !== userid) return res.status(403).send("-- HWID Mismatch");

  const lua = `
_G.MakalResult = {
  HWID = "${hwid}",
  UserID = ${userid},
  Username = "${user.username}",
  Status = "${user.status}"
}
print("Welcome,", _G.MakalResult.Username)
print("HWID:", _G.MakalResult.HWID)
print("UserID:", _G.MakalResult.UserID)
print("Status:", _G.MakalResult.Status)
`;
  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(lua.trim());
}
