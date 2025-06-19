import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (req.headers["user-agent"] !== "MakalHubExecutor") return res.status(403).end();
  const { token } = req.query;
  if (!token) return res.status(400).end();
  const parts = token.split(":");
  if (parts.length !== 4) return res.status(400).end();
  const [uid, usr, exp, sig] = parts;
  if (Date.now() > +exp) return res.status(403).end();
  const ok = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(`${uid}:${usr}:${exp}`)
    .digest("hex");
  if (sig !== ok) return res.status(403).end();

  const lua = `
local r=(syn and syn.request)or(http and http.request)or request or http_request
assert(r,"Executor not supported")
local H=game:GetService("HttpService")
local P=game:GetService("Players").LocalPlayer
local placeId=game.PlaceId
local m={[537413528]="babft"}
local name=m[placeId]
assert(name,"Unsupported game")
local init=r{Url=("https://makalhub.vercel.app/api/init?userid=%d&username=%s"):format(P.UserId,H:UrlEncode(P.Name)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
assert(init and init.Body,"Init failed")
local token=H:JSONDecode(init.Body).token
assert(token,"Token missing")
local scr=r{Url=("https://makalhub.vercel.app/api/script/%s?token=%s"):format(name,H:UrlEncode(token)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
assert(scr and scr.Body,"Script fetch failed")
loadstring(scr.Body)()
`.trim();

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(lua);
}
