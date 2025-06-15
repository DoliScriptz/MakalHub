import crypto from "crypto";

export default async function handler(req, res) {
  const fallbackUserId = "0";
  const fallbackUsername = "Anonymous";
  const secret = process.env.HWID_SECRET || "default_secret";

  const base = `${fallbackUserId}:${fallbackUsername}`;
  const hwid = crypto.createHmac("sha256", secret).update(base).digest("hex");

  // Fetch HWID list from GitHub
  let hwidList = [];
  try {
    const github = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
    const json = await github.json();
    hwidList = json.hwids || [];
  } catch (e) {
    return res.status(500).send("-- GitHub fetch failed");
  }

  const isPremium = hwidList.includes(hwid);

  const lua = `
-- MakalHub HWID Check
local result = {
  hwid = "${hwid}",
  isPremium = ${isPremium}
}

_G.MakalResult = result

print("🧠 MakalHub Loaded")
print("🔑 HWID:", result.hwid)
print("⭐ Premium:", result.isPremium)
`;

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(lua.trim());
}
