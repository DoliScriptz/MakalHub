import crypto from "crypto";

export default async function handler(req, res) {
  const { userid, username } = req.query;
  const secret = process.env.HWID_SECRET || "default_secret";

  // 🌐 Block browsers
  const ua = req.headers["user-agent"] || "";
  const isBrowser = ua.includes("Mozilla") || ua.includes("Chrome") || ua.includes("Safari");
  if (isBrowser || req.method !== "GET") {
    return res.status(403).send("-- Forbidden");
  }

  // 🔒 Validate input
  if (!userid || !username) {
    return res.status(400).send("-- Missing userid or username");
  }

  // 🧠 Generate HWID
  const base = `${userid}:${username}`;
  const hwid = crypto.createHmac("sha256", secret).update(base).digest("hex");

  // 📄 Fetch hwids.json from GitHub
  let hwidData = {};
  try {
    const raw = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
    hwidData = await raw.json();
  } catch (e) {
    return res.status(500).send("-- Failed to fetch hwids.json");
  }

  const premium = hwidData.premium || {};
  const blacklist = hwidData.blacklist || {};

  // ❌ If blacklisted
  if (blacklist[hwid]) {
    return res.status(200).send(`game.Players.LocalPlayer:Kick("❌ You are blacklisted.")`);
  }

  const isPremium = !!premium[hwid];

  // 📜 Return raw Lua script
  const lua = `
-- MakalHub: init.lua
_G.MakalResult = {
  hwid = "${hwid}",
  isPremium = ${isPremium},
  username = "${username}",
  userid = ${userid}
}

print("✅ MakalHub Loaded")
print("🔑 HWID:", _G.MakalResult.hwid)
print("💎 Premium:", _G.MakalResult.isPremium)
`;

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(lua.trim());
}
