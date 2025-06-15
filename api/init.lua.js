import crypto from "crypto";

export default async function handler(req, res) {
  // Random fallback (fake) user info, since no headers or query
  const fallbackUserId = "0";
  const fallbackUsername = "Anonymous";
  const secret = process.env.HWID_SECRET || "default_secret";

  // HWID Generation — no input from client
  const base = `${fallbackUserId}:${fallbackUsername}`;
  const hwid = crypto.createHmac("sha256", secret).update(base).digest("hex");

  // Load existing premium HWIDs from GitHub
  let hwidList = [];
  try {
    const github = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
    const json = await github.json();
    hwidList = json.hwids || [];
  } catch (e) {
    return res.status(500).send("-- GitHub fetch failed");
  }

  const isPremium = hwidList.includes(hwid);

  // Response is a real Lua script
  const lua = `
-- MakalHub HWID Init
local result = {
  hwid = "${hwid}",
  isPremium = ${isPremium}
}

if result.isPremium then
  print("✅ Premium verified:", result.hwid)
else
  print("🔓 Free mode:", result.hwid)
end

_G.MakalResult = result
`;

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(lua.trim());
}
