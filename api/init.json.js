import crypto from "crypto";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).json({ status: "error" });
  const hwid = crypto.createHmac("sha256", process.env.HWID_SECRET)
                     .update(`${userid}:${username}`).digest("hex");
  const r = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
  const db = await r.json().catch(()=>({ users: {} }));
  db.users ||= {};
  if (!db.users[hwid]) {
    db.users[hwid] = { userid: Number(userid), username, status: "free", added: new Date().toISOString() };
    const content = Buffer.from(JSON.stringify(db, null, 2)).toString("base64");
    await fetch("https://api.github.com/repos/DoliScriptz/MakalHub/contents/hwids.json", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: `register ${username}`, content, sha: (await r.json()).sha })
    });
  }
  const user = db.users[hwid];
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ status: "success", user: { hwid, userid: user.userid, username: user.username, status: user.status } }));
}
