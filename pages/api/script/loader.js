import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (req.headers["user-agent"] !== "MakalHubExecutor") return res.status(403).end();

  const { token } = req.query;
  if (!token) return res.status(400).end();

  const parts = token.split(":");
  if (parts.length !== 4) return res.status(400).end();

  const [uid, username, expires, sig] = parts;
  if (Date.now() > parseInt(expires, 10)) return res.status(403).end();

  const expectedSig = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(`${uid}:${username}:${expires}`)
    .digest("hex");

  if (sig !== expectedSig) return res.status(403).end();

  const lua = `
    local r=(syn and syn.request)or(http and http.request)or request or http_request
    assert(r,"HTTP unsupported")
    local h=game:GetService("HttpService")
    local p=game:GetService("Players").LocalPlayer
    local gid=game.PlaceId
    local map={[537413528]="babft"}
    local name=map[gid]
    assert(name,"Game not supported")
    local i=r{Url=("https://makalhub.vercel.app/api/init?userid="..p.UserId.."&username="..h:UrlEncode(p.Name)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
    local t=h:JSONDecode(i.Body).token
    local s=r{Url=("https://makalhub.vercel.app/api/script/"..name.."?token="..h:UrlEncode(t)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
    assert(s and s.Body,"Script fetch failed")
    loadstring(s.Body)()
  `.trim();

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(lua);
}
