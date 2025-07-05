import crypto from "crypto";

export default async function handler(req, res) {
  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).json({ status: "error" });

  const base = `${userid}:${username}`;
  const base64 = Buffer.from(base).toString("base64");
  const xor = Buffer.from(base64).map(b => b ^ 0xAA).toString("hex");

  const hwid = crypto.createHash("sha256").update(base).digest("hex");

  const repo = "DoliScriptz/MakalHub";
  const token = process.env.GITHUB_TOKEN;
  const gh = await fetch(`https://api.github.com/repos/${repo}/contents/hwids.json`);
  const json = await gh.json();
  const db = JSON.parse(Buffer.from(json.content, "base64").toString());
  db.users = db.users || {};

  if (!db.users[hwid]) {
    db.users[hwid] = {
      userid: Number(userid),
      username,
      status: "free"
    };
    const update = Buffer.from(JSON.stringify(db, null, 2)).toString("base64");
    await fetch(`https://api.github.com/repos/${repo}/contents/hwids.json`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `add ${username}`,
        content: update,
        sha: json.sha
      })
    });
  }

  const user = db.users[hwid];
  res.json({
    status: "success",
    key: xor,
    user: {
      hwid,
      userid: user.userid,
      username: user.username,
      status: user.status
    }
  });
}
