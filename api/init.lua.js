import crypto from "crypto";

function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return Buffer.from(bytes);
}

function xor(buf, key) {
  const k = Buffer.from(key);
  for (let i = 0; i < buf.length; i++) {
    buf[i] ^= k[i % k.length];
  }
  return buf;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("forbidden");
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  if (!ua.includes("makalhubexecutor")) return res.status(403).send("forbidden");

  const enc = req.query.key;
  if (!enc) return res.status(400).send("forbidden");

  let buf = hexToBytes(enc);
  buf = xor(buf, "\u00AA");
  const b64 = buf.toString("utf8");
  const dec = Buffer.from(b64, "base64").toString("utf8");
  const [hwid, userid] = dec.split(":");

  let db = { users: {} };
  try {
    const r = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
    db = await r.json();
  } catch {}
  const user = db.users[hwid];
  const status = user && user.userid.toString() === userid ? user.status : "blacklist";

  res.setHeader("Content-Type", "text/plain");
  res.end(`
_G.MakalResult = {
  hwid = "${hwid}",
  userid = ${userid},
  username = "${user?.username or "Unknown"}",
  status = "${status}"
}
`);
}
