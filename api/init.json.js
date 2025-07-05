import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ status: "error" });

  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).json({ status: "error" });

  const base = `${userid}:${username}`;
  const hwid = crypto.createHash("sha256").update(base).digest("hex");

  const owner = "DoliScriptz";
  const repo = "MakalHub";
  const file = "hwids.json";
  const token = process.env.GITHUB_TOKEN;

  let sha = "";
  let db = { users: {} };

  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await resp.json();
    sha = json.sha;
    db = JSON.parse(Buffer.from(json.content, "base64").toString());
  } catch {
    db = { users: {} };
  }

  if (!db.users[hwid]) {
    db.users[hwid] = {
      username,
      userid: Number(userid),
      status: "free",
      added: new Date().toISOString()
    };

    const updated = {
      message: `Add user ${username}`,
      content: Buffer.from(JSON.stringify(db, null, 2)).toString("base64"),
      sha
    };

    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updated)
    });
  }

  const user = db.users[hwid];
  res.status(200).json({
    status: "success",
    user: {
      hwid,
      username: user.username,
      userid: user.userid,
      status: user.status
    }
  });
}
