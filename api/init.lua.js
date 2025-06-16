export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(`
local HttpService = game:GetService("HttpService")
local Players     = game:GetService("Players")
local lp          = Players.LocalPlayer

function isPremiumUser()
    local url = ("https://makalhub.vercel.app/api/init.json?userid=%d&username=%s")
        :format(lp.UserId, HttpService:UrlEncode(lp.Name))
    local ok, body = pcall(HttpService.GetAsync, HttpService, url)
    if not ok then return false end
    local data = HttpService:JSONDecode(body)
    if data.status ~= "success" then return false end
    return data.user.status == "premium"
end
`)
}
