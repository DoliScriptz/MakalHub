import fs from "fs";import path from "path";import crypto from "crypto";
export default function handler(req,res){
  if(req.method!=="GET")return res.status(405).end();
  if(req.headers["user-agent"]!=="MakalHubExecutor")return res.status(403).end();
  const{name,token}=req.query;
  if(!name||!token)return res.status(400).end();
  const parts=token.split(":");
  if(parts.length!==4)return res.status(400).end();
  const[uid,usr,exp,sig]=parts;
  if(Date.now()>+exp)return res.status(403).end();
  const ok=crypto.createHmac("sha256",process.env.HWID_SECRET).update(`${uid}:${usr}:${exp}`).digest("hex");
  if(sig!==ok)return res.status(403).end();
  const p=path.resolve("scripts",`${name}.lua`);
  if(!fs.existsSync(p))return res.status(404).end();
  const s=fs.readFileSync(p,"utf8");
  res.setHeader("Content-Type","text/plain");res.status(200).send(s);
}
