import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).json({ status: "error" });

  const hwid = crypto
    .createHmac("sha256", process.env.HWID_SECRET || "")
    .update(`${userid}:${username}`)
    .digest("hex");

  const owner = "DoliScriptz";
  const repo  = "MakalHub";
  const path  = "hwids.json";
  const token = process.env.GITHUB_TOKEN;

  // fetch and parse
  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
  const j    = await resp.json();
  const sha  = j.sha;
  const db   = JSON.parse(Buffer.from(j.content, "base64").toString());
  db.users    = db.users || {};

  // auto-register if new
  if (!db.users[hwid]) {
    db.users[hwid] = {
      userid: Number(userid),
      username,
      status: "free",
      added: new Date().toISOString()
    };
    const content = Buffer.from(JSON.stringify(db, null, 2)).toString("base64");
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `register ${username}`,
        content,
        sha
      })
    });
  }

  const user = db.users[hwid];
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    status: "success",
    user: {
      hwid:     hwid,
      userid:   user.userid,
      username: user.username,
      status:   user.status
    }
  });
}
