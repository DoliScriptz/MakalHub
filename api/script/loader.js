import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (req.headers["user-agent"] !== "MakalHubExecutor") return res.status(403).end("Forbidden");

  const { token } = req.query;
  if (!token) return res.status(400).end("Missing token");

  const parts = token.split(":");
  if (parts.length !== 4) return res.status(400).end("Malformed token");

  const [userid, username, expires, sig] = parts;
  if (Date.now() > parseInt(expires)) return res.status(403).end("Token expired");

  const expected = crypto.createHmac("sha256", process.env.HWID_SECRET)
    .update(`${userid}:${username}:${expires}`)
    .digest("hex");
  if (sig !== expected) return res.status(403).end("Invalid token");

  const lua = `
local req=(syn and syn.request)or(http and http.request)or(request)or(http_request)
assert(req,"Executor not supported")
local H=game:GetService("HttpService")
local P=game:GetService("Players").LocalPlayer
local id=game.PlaceId
local m={[537413528]="babft"}
local n=m[id] assert(n,"Game not supported")
local r=req{Url=("https://makalhub.vercel.app/api/init?userid=%d&username=%s"):format(P.UserId,H:UrlEncode(P.Name)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}} local d=H:JSONDecode(r.Body)
local k=req{Url=("https://makalhub.vercel.app/api/script/%s?token=%s"):format(n,H:UrlEncode(d.token)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
assert(k and k.Body,"Script fetch failed") loadstring(k.Body)()
  `.trim()

  res.setHeader("Content-Type", "text/plain")
  return res.status(200).send(lua)
}
