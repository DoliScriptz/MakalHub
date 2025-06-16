import crypto from "crypto";

export default async function handler(req, res) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  if ((ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari")) || req.method !== "GET")
    return res.status(403).send("-- forbidden");

  const userid   = req.headers["x-userid"];
  const username = req.headers["x-username"];
  if (!userid || !username)
    return res.status(400).send("-- missing headers");

  const hwid = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(`${userid}:${username}`)
    .digest("hex");

  const owner = "DoliScriptz";
  const repo  = "MakalHub";
  const path  = "hwids.json";
  let db = { premium: {}, blacklist: {} }, sha = "";

  try {
    const r    = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const js   = await r.json();
    sha        = js.sha;
    db         = JSON.parse(Buffer.from(js.content, "base64").toString());
    db.premium   = db.premium   || {};
    db.blacklist = db.blacklist || {};
  } catch {}

  if (!db.premium[hwid] && !db.blacklist[hwid]) {
    db.premium[hwid] = { userid: Number(userid), username, added: new Date().toISOString() };
    const content = Buffer.from(JSON.stringify(db, null, 2)).toString("base64");
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method:  "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type":  "application/json"
      },
      body: JSON.stringify({ message: `register ${username}`, content, sha })
    });
  }

  const isPremium = !!db.premium[hwid];

  const lua = `
_G.MakalResult = {
  hwid = "${hwid}",
  userid = ${userid},
  username = "${username}",
  isPremium = ${isPremium}
}

print("Welcome, " .. _G.MakalResult.username)
print("HWID: "     .. _G.MakalResult.hwid)
print("Username: " .. _G.MakalResult.username)
print("UserID: "   .. _G.MakalResult.userid)
print("Premium: "  .. (_G.MakalResult.isPremium and "Yes" or "No"))
`;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(lua.trim());
}
