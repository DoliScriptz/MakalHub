// api/init.lua.js
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("forbidden");
  const ua = (req.headers["user-agent"]||"").toLowerCase();
  if (!ua.includes("makalhubexecutor")) return res.status(403).send("forbidden");
  const key = req.query.key; if (!key) return res.status(400).send("forbidden");
  const buf = Buffer.from(key.match(/../g).map(h=>parseInt(h,16)));
  for (let i=0;i<buf.length;i++) buf[i]^=0xAA;
  const dec = Buffer.from(buf.toString("utf8"), "base64").toString("utf8");
  const [hwid,userid] = dec.split(":");
  const db = await fetch("https://raw.githubusercontent.com/DoliScriptz/MakalHub/main/hwids.json")
                  .then(r=>r.json()).catch(()=>({ users:{} }));
  const u = db.users[hwid];
  const status = u && u.userid.toString()===userid ? u.status : "blacklist";
  res.setHeader("Content-Type", "text/plain");
  res.end(`_G.MakalResult={hwid="${hwid}",userid=${userid},username="${u?u.username:"Unknown"}",status="${status}"}`);
}
