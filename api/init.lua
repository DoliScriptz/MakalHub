import crypto from "crypto";

export default async function handler(req, res) {
  const { userid, username } = req.query;
  const secret = process.env.HWID_SECRET;

  if (!userid || !username || !secret) {
    return res.status(400).send("-- error: missing required fields");
  }

  const hwid = crypto
    .createHmac("sha256", secret)
    .update(`${userid}:${username}`)
    .digest("hex");

  const fileUrl = "https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json";

  let hwidList = [];
  try {
    const response = await fetch(fileUrl);
    const json = await response.json();
    hwidList = json.hwids || [];
  } catch (e) {
    return res.status(500).send("-- error: failed to fetch hwids");
  }

  const isPremium = hwidList.includes(hwid);
  const isBlacklisted = false; // You can expand this

  // Return as full Lua script
  return res.status(200).send(`
local result = {
  hwid = "${hwid}",
  isPremium = ${isPremium},
  isBlacklisted = ${isBlacklisted}
}

if result.isBlacklisted then
  game.Players.LocalPlayer:Kick("🚫 You are blacklisted.")
elseif result.isPremium then
  print("✅ Premium user verified:", result.hwid)
  -- Premium logic here
else
  print("🔓 Free user. HWID:", result.hwid)
  -- Free logic here
end

_G.MakalResult = result
`);
}
