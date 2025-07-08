import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).json({ status: "error" });

  const secret = process.env.HWID_SECRET || "";
  const githubToken = process.env.GITHUB_TOKEN;

  const hwid = crypto.createHmac("sha256", secret).update(`${userid}:${username}`).digest("hex");

  const owner = "DoliScriptz";
  const repo = "MakalHub";
  const path = "hwids.json";

  let hwids = { users: {} };
  let sha = "";

  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${githubToken}` }
  });

  const json = await resp.json();
  if (json.content) {
    sha = json.sha;
    hwids = JSON.parse(Buffer.from(json.content, "base64").toString());
  }

  hwids.users = hwids.users || {};

  if (!hwids.users[hwid]) {
    hwids.users[hwid] = {
      userid: Number(userid),
      username,
      status: "free",
      added: new Date().toISOString()
    };

    const content = Buffer.from(JSON.stringify(hwids, null, 2)).toString("base64");

    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `register ${username}`,
        content,
        sha
      })
    });
  }

  const user = hwids.users[hwid];
  const lua = `
_G.MakalResult = {
  hwid = "${hwid}",
  userid = ${user.userid},
  username = "${user.username}",
  status = "${user.status}"
}

print("✅ Welcome, ${user.username}")
print("🔑 HWID:", _G.MakalResult.hwid)
print("⭐ Status:", _G.MakalResult.status)
`;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(lua.trim());
}
