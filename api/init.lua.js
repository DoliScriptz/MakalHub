import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).send("-- Error: Missing");

  const secret = process.env.HWID_SECRET || "";
  const githubToken = process.env.GITHUB_TOKEN;

  const hwid = crypto.createHmac("sha256", secret).update(`${userid}:${username}`).digest("hex");

  const owner = "DoliScriptz";
  const repo = "MakalHub";
  const path = "hwids.json";

  let users = {};
  let sha = "";

  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${githubToken}` }
  });
  const json = await resp.json();

  if (json.content) {
    sha = json.sha;
    users = JSON.parse(Buffer.from(json.content, "base64").toString());
  }

  users.users = users.users || {};

  if (!users.users[hwid]) {
    users.users[hwid] = {
      userid: Number(userid),
      username,
      status: "free",
      added: new Date().toISOString()
    };

    const payload = {
      message: `register ${username}`,
      content: Buffer.from(JSON.stringify(users, null, 2)).toString("base64"),
      sha
    };

    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  }

  const user = users.users[hwid];
  const lua = `
_G.MakalResult = {
  hwid = "${hwid}",
  userid = ${user.userid},
  username = "${user.username}",
  status = "${user.status}"
}
print("✅ Welcome: ".._G.MakalResult.username)
print("🔑 HWID: ".._G.MakalResult.hwid)
print("⭐ Status: ".._G.MakalResult.status)
`;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(lua.trim());
}
