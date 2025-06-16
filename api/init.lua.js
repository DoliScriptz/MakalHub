export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.end(`
local HttpService = game:GetService("HttpService")
local Players     = game:GetService("Players")
local lp          = Players.LocalPlayer

local function getUserData()
  local url = string.format(
    "https://makalhub.vercel.app/api/init.json?userid=%d&username=%s",
    lp.UserId,
    HttpService:UrlEncode(lp.Name)
  )
  local req = (syn and syn.request) or (http and http.request) or request
  if not req then error("No HTTP support") end
  local res = req({ Url = url, Method = "GET" })
  if not res or not res.Body then error("Access Error") end
  local ok, data = pcall(HttpService.JSONDecode, HttpService, res.Body)
  if not ok or data.status ~= "success" then error("Access Error") end
  return data.user
end

local user = getUserData()
_G.MakalResult = user

print("Welcome, " .. user.username)
print("🔑 HWID:    " .. user.hwid)
print("🆔 UserID:  " .. user.userid)
print("⭐ Status:  " .. user.status)
`);
}
