import crypto from "crypto";

export default async function handler(req, res) {
  const { key } = req.query;
  if (!key) return res.status(400).send("-- No key");

  const repo = "DoliScriptz/MakalHub";
  const gh = await fetch(`https://api.github.com/repos/${repo}/contents/hwids.json`);
  const json = await gh.json();
  const db = JSON.parse(Buffer.from(json.content, "base64").toString());
  db.users = db.users || {};

  let matched = null;
  for (const [hwid, data] of Object.entries(db.users)) {
    const base = `${data.userid}:${data.username}`;
    const b64 = Buffer.from(base).toString("base64");
    const xor = Buffer.from(b64).map(b => b ^ 0xAA).toString("hex");
    if (xor === key) {
      matched = { hwid, ...data };
      break;
    }
  }

  if (!matched) return res.status(403).send("-- Invalid key");

  const lua = `
_G.MakalResult = {
  HWID = "${matched.hwid}",
  UserID = ${matched.userid},
  Username = "${matched.username}",
  Status = "${matched.status}"
}

print("Welcome,", _G.MakalResult.Username)
print("HWID:", _G.MakalResult.HWID)
print("UserID:", _G.MakalResult.UserID)
print("Premium:", _G.MakalResult.Status)
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(lua.trim());
        }
