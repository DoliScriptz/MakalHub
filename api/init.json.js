import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).json({ status: "error", reason: "Missing userid or username" });

  const hwid = crypto
    .createHmac("sha256", process.env.HWID_SECRET || "")
    .update(`${userid}:${username}`)
    .digest("hex");

  let db = { users: {} };
  try {
    const resp = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
    db = await resp.json();
  } catch {}

  db.users = db.users || {};
  if (!db.users[hwid]) {
    db.users[hwid] = {
      userid: Number(userid),
      username,
      status: "free",
      added: new Date().toISOString()
    };
    // (You can choose to write back here if you want auto-registration)
  }

  const user = db.users[hwid];
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    status: "success",
    user: { hwid, userid: user.userid, username: user.username, status: user.status }
  }));
}
