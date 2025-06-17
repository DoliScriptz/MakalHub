export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("forbidden");
  const ua = (req.headers["user-agent"]||"").toLowerCase();
  if (!ua.includes("makalhubexecutor")) return res.status(403).send("forbidden");
  const key = req.query.key;
  if (!key) return res.status(400).send("forbidden");

  const hexToBytes = h=>Buffer.from(h.match(/../g).map(x=>parseInt(x,16)));
  const buf = hexToBytes(key).map((v,i,arr)=>v^0xAA);
  const b64 = buf.toString("utf8");
  const dec = Buffer.from(b64,"base64").toString("utf8");
  const [hwid,userid] = dec.split(":");

  let db = { users: {} };
  try {
    const r = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json");
    db = await r.json();
  } catch {}
  const u = db.users[hwid];
  const status = u && u.userid.toString()===userid ? u.status : "blacklist";

  res.setHeader("Content-Type", "text/plain");
  res.end(`_G.MakalResult={hwid="${hwid}",userid=${userid},username="${u?u.username:"Unknown"}",status="${status}"}`);
}
