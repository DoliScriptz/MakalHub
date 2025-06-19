import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const ua = req.headers["user-agent"];
  if (ua !== "MakalHubExecutor") return res.status(403).end("Forbidden");

  const { token } = req.query;
  if (!token) return res.status(400).end("Missing token");

  const parts = token.split(":");
  if (parts.length !== 4) return res.status(400).end("Malformed token");

  const [userid, username, expires, signature] = parts;
  if (Date.now() > +expires) return res.status(403).end("Token expired");

  const expectedSig = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(`${userid}:${username}:${expires}`)
    .digest("hex");

  if (expectedSig !== signature) return res.status(403).end("Invalid signature");

  // Respond with the protected Lua loader code
  const lua = `
local r=(syn and syn.request)or(http and http.request)or(request)or(http_request)
assert(r, "Executor not supported")
local h=game:GetService("HttpService")
local p=game:GetService("Players").LocalPlayer
local gid=game.PlaceId
local map={[537413528]="babft"}
local name=map[gid]
assert(name, "Unsupported game")
local s=r({
  Url=("https://makalhub.vercel.app/api/script/"..name.."?token="..h:UrlEncode("${token}")),
  Method="GET",
  Headers={["User-Agent"]="MakalHubExecutor"}
})
assert(s and s.Body, "Script fetch failed")
loadstring(s.Body)()
`.trim();

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(lua);
}
