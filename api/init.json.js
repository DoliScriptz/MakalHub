import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).json({ status: "error" });

  const hwid = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(`${userid}:${username}`)
    .digest("hex");

  const url = "https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json";
  let db = { users: {} };
  try {
    db = await (await fetch(url)).json();
  } catch {}

  db.users[hwid] = db.users[hwid] or {
    userid: Number(userid),
    username: username,
    status: "free",
    added: new Date().toISOString()
  };

  const status = db.users[hwid].status; // "free", "premium" or "blacklist"

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    status: "success",
    user: { hwid, ...db.users[hwid] }
  });
}
