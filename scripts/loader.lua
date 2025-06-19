-- scripts/loader.lua
local req = (syn and syn.request)
         or (http_request)
         or (http and http.request)
         or (fluxus and fluxus.request)
         or (krnl and krnl.request)
         or request
assert(req, "Executor not supported")

local HttpService = game:GetService("HttpService")
local Player      = game:GetService("Players").LocalPlayer
local placeId     = game.PlaceId

local gameMap = {
    [537413528] = "babft",
    -- add more PlaceIds
}

local name = gameMap[placeId]
assert(name, "Unsupported game")

local initRes = req{
    Url     = ("https://makalhub.vercel.app/api/init?userid=%d&username=%s")
                :format(Player.UserId, HttpService:UrlEncode(Player.Name)),
    Method  = "GET",
    Headers = { ["User-Agent"] = "MakalHubExecutor" }
}
assert(initRes and initRes.Body, "Init request failed")

local initData = HttpService:JSONDecode(initRes.Body)
assert(initData.token, "Token missing"
local scriptRes = req{
    Url     = ("https://makalhub.vercel.app/api/script/%s?token=%s")
                :format(name, HttpService:UrlEncode(initData.token)),
    Method  = "GET",
    Headers = { ["User-Agent"] = "MakalHubExecutor" }
}
assert(scriptRes and scriptRes.Body, "Script fetch failed")
assert(scriptRes.StatusCode == 200, "Failed to fetch script: "..tostring(scriptRes.StatusCode))
loadstring(scriptRes.Body)()
