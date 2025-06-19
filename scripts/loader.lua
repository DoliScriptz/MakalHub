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
local init = req({
    Url = ("https://makalhub.vercel.app/api/init?userid=%d&username=%s"):format(Player.UserId, HttpService:UrlEncode(Player.Name)),
    Method = "GET",
    Headers = { ["User-Agent"] = "MakalHubExecutor" }
})
local token = HttpService:JSONDecode(init.Body).token
assert(token, "Token error")

local s = req({
    Url = ("https://makalhub.vercel.app/api/script/%s?token=%s"):format(name, HttpService:UrlEncode(token)),
    Method = "GET",
    Headers = { ["User-Agent"] = "MakalHubExecutor" }
})
assert(s and s.StatusCode == 200, "Fetch failed")
loadstring(s.Body)()
