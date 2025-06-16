export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(`
local HttpService = game:GetService("HttpService")
local Players     = game:GetService("Players")
local lp          = Players.LocalPlayer

local function getUserData()
    local url = ("https://makalhub.vercel.app/api/init.json?userid=%d&username=%s")
        :format(lp.UserId, HttpService:UrlEncode(lp.Name))
    local ok, body = pcall(HttpService.GetAsync, HttpService, url)
    if not ok then error("Access Error") end
    local data = HttpService:JSONDecode(body)
    if data.status ~= "success" then error("Access Error") end
    return data.user
end

local user = getUserData()
_G.MakalResult = user

print("Welcome, " .. user.username)
print("🔑 HWID:     " .. user.hwid)
print("👤 Username: " .. user.username)
print("🆔 UserID:   " .. user.userid)
print("⭐ Premium:   " .. tostring(user.status == "premium"))
`)
}
