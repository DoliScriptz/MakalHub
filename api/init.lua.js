export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(`
local HttpService = game:GetService("HttpService")
local Players     = game:GetService("Players")
local lp          = Players.LocalPlayer

function getUserData()
  local url = ("https://makalhub.vercel.app/api/init.json?userid=%d&username=%s")
    :format(lp.UserId, HttpService:UrlEncode(lp.Name))
  local ok, body = pcall(HttpService.GetAsync, HttpService, url)
  if not ok then return nil end
  local d = HttpService:JSONDecode(body)
  if d.status ~= "success" then return nil end
  return d.user
end

local data = getUserData()
if not data then
  error("Access error")
end

_G.MakalResult = data

print("Welcome, " .. data.username)
print("HWID:     " .. data.hwid)
print("UserID:   " .. data.userid)
print("Status:   " .. data.status)
`)
}
