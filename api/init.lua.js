import crypto from "crypto";

export default async function handler(req, res) {
  const secret = process.env.HWID_SECRET || "default_secret";
  const githubToken = process.env.GITHUB_TOKEN; // your PAT
  const repoOwner = "DoliScriptz";
  const repoName = "MakalHub";
  const fileName = "hwids.json";

  const ua = req.headers["user-agent"] || "";
  if (ua.includes("Mozilla") || ua.includes("Chrome") || ua.includes("Safari") || req.method !== "GET") {
    return res.status(403).send("-- ❌ Forbidden");
  }

  // Get UserId and Username from headers or fallback
  const referer = req.headers["referer"] || "";
  const match = referer.match(/userid=(\d+)&username=([A-Za-z0-9_]+)/);
  const userid = match ? match[1] : "0";
  const username = match ? match[2] : "Anonymous";
  const base = `${userid}:${username}`;
  const hwid = crypto.createHmac("sha256", secret).update(base).digest("hex");

  // Get current hwids.json
  let hwids = {};
  let sha = "";
  try {
    const resp = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`);
    const json = await resp.json();
    const content = Buffer.from(json.content, "base64").toString();
    hwids = JSON.parse(content);
    sha = json.sha;
  } catch (e) {
    hwids = {};
  }

  // Add if not exists
  if (!hwids[hwid]) {
    hwids[hwid] = {
      premium: false,
      username,
      userid: Number(userid)
    };

    const payload = {
      message: "Auto-register HWID",
      content: Buffer.from(JSON.stringify(hwids, null, 2)).toString("base64"),
      sha,
    };

    await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  }

  const isPremium = hwids[hwid]?.premium || false;

  const lua = `
-- ✅ MakalHub Init
_G.MakalResult = {
  hwid = "${hwid}",
  userid = ${userid},
  username = "${username}",
  isPremium = ${isPremium}
}

print("✅ MakalHub Loaded")
print("🔑 HWID:", _G.MakalResult.hwid)
print("⭐ Premium:", _G.MakalResult.isPremium)
`;

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(lua.trim());
}
