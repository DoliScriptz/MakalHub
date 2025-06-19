import crypto from "crypto";
export default function handler(req,res){
  if(req.method!=="GET")return res.status(405).end();
  if(req.headers["user-agent"]!=="MakalHubExecutor")return res.status(403).end();
  const{token}=req.query;
  if(!token)return res.status(400).end();
  const parts=token.split(":");
  if(parts.length!==4)return res.status(400).end();
  const[uid,usr,exp,sig]=parts;
  if(Date.now()>+exp)return res.status(403).end();
  const ok=crypto.createHmac("sha256",process.env.HWID_SECRET).update(`${uid}:${usr}:${exp}`).digest("hex");
  if(sig!==ok)return res.status(403).end();
  const lua=`
local r=(syn and syn.request)or(http and http.request)or(request)or(http_request)
assert(r)
local h=game:GetService("HttpService")
local p=game.Players.LocalPlayer
local m={[537413528]="babft"}
local n=m[game.PlaceId]
assert(n)
local i=r{Url=("https://makalhub.vercel.app/api/init?userid=%d&username=%s"):format(p.UserId,h:UrlEncode(p.Name)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
local t=h:JSONDecode(i.Body).token
local s=r{Url=("https://makalhub.vercel.app/api/script/%s?token=%s"):format(n,h:UrlEncode(t)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
assert(s and s.Body)
loadstring(s.Body)()
`.trim();
  res.setHeader("Content-Type","text/plain");res.status(200).send(lua);
}
