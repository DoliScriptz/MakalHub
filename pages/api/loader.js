import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (req.headers["user-agent"] !== "MakalHubExecutor") return res.status(403).end();

  const { token } = req.query;
  if (!token) return res.status(400).end();

  const parts = token.split(":");
  if (parts.length !== 4) return res.status(400).end("Malformed token");
  const [uid, usr, exp, sig] = parts;

  if (Date.now() > +exp) return res.status(403).end("Token expired");

  const expected = crypto.createHmac("sha256", process.env.HWID_SECRET).update(`${uid}:${usr}:${exp}`).digest("hex");
  if (sig !== expected) return res.status(403).end("Invalid token");

  const lua = `
local req = (syn and syn.request) or (http_request) or (http and http.request) or request
assert(req, "Executor not supported")

local HttpService = game:GetService("HttpService")
local Player = game:GetService("Players").LocalPlayer
local placeId = game.PlaceId

local gameMap = {
  [537413528] = "babft"
}

local name = gameMap[placeId]
assert(name, "Unsupported game")

local scriptRes = req({
  Url = "https://makalhub.vercel.app/api/script/" .. name .. "?token=" .. HttpService:UrlEncode("${token}"),
  Method = "GET",
  Headers = { ["User-Agent"] = "MakalHubExecutor" }
})

assert(scriptRes and scriptRes.StatusCode == 200, "Failed to fetch script")
loadstring(scriptRes.Body)()
`;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(lua.trim());
}
