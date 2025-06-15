import crypto from "crypto";

export default async function handler(req, res) {
  const secret = process.env.HWID_SECRET || "default_secret";

  // 🚫 Block browser access (simple anti-visit)
  const ua = req.headers["user-agent"] || "";
  const forbidden = ua.includes("Mozilla") || ua.includes("Chrome") || ua.includes("Safari");

  if (forbidden || req.method !== "GET") {
    return res.status(403).send("-- ❌ Forbidden");
  }

  // ✅ Attempt to auto-parse UserId and Username from Referer header
  const referer = req.headers["referer"] || "";
  const match = referer.match(/userid=(\d+)&username=([A-Za-z0-9_]+)/);

  const userid = match ? match[1] : "0";
  const username = match ? match[2] : "Anonymous";

  // 🔐 HWID generation
  const base = `${userid}:${username}`;
  const hwid = crypto.createHmac("sha256", secret).update(base).digest("hex");

  // 🧠 Fetch GitHub JSON for premium data
  let isPremium = false;
  try {
    const resp = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
    const json = await resp.json();
    isPremium = (json[hwid] && json[hwid].premium) === true;
  } catch (err) {
    return res.status(500).send("-- ❌ Failed to load premium data");
  }

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
