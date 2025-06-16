function base64(str) {
  return Buffer.from(str).toString("base64");
}

function toHex(str) {
  return Buffer.from(str).toString("hex");
}

function xorHex(hexStr, key) {
  const keyBytes = Buffer.from(key);
  const input = Buffer.from(hexStr, "hex");
  const output = Buffer.alloc(input.length);
  for (let i = 0; i < input.length; i++) {
    output[i] = input[i] ^ keyBytes[i % keyBytes.length];
  }
  return output.toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { userid, username } = req.query;
  const secret = process.env.HWID_SECRET || "default_secret";

  if (!userid || !username) {
    return res.status(400).json({ status: "error", reason: "Missing userid or username" });
  }

  // Step 1: base64
  const base = base64(`${userid}:${username}`);

  // Step 2: hex of base64
  const hexBase = toHex(base);

  // Step 3: xor hex
  const hwid = xorHex(hexBase, secret);

  // Load hwids.json
  const owner = "DoliScriptz";
  const repo = "MakalHub";
  const path = "hwids.json";
  const token = process.env.GITHUB_TOKEN;

  let db = { users: {} };
  let sha = "";

  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const j = await r.json();
    sha = j.sha;
    db = JSON.parse(Buffer.from(j.content, "base64").toString());
    db.users ||= {};
  } catch { /* skip on first run */ }

  // Auto-register if not exists
  if (!db.users[hwid]) {
    db.users[hwid] = {
      userid: Number(userid),
      username,
      status: "free",
      added: new Date().toISOString()
    };

    const content = Buffer.from(JSON.stringify(db, null, 2)).toString("base64");
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Auto-register ${username}`,
        content,
        sha
      })
    });
  }

  const user = db.users[hwid];

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    status: "success",
    user: {
      hwid,
      userid: user.userid,
      username: user.username,
      status: user.status
    }
  });
}
