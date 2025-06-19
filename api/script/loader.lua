local http = (syn and syn.request) or (http and http.request) or request or http_request
assert(http, "Executor not supported")

local hs = game:GetService("HttpService")
local pl = game:GetService("Players").LocalPlayer
local gid = game.PlaceId

local games = {
    [537413528] = "babft"
}

local name = games[gid]
assert(name, "Game not supported")

local init = http({
    Url = ("https://makalhub.vercel.app/api/init?userid=%s&username=%s"):format(
        hs:UrlEncode(pl.UserId),
        hs:UrlEncode(pl.Name)
    ),
    Method = "GET",
    Headers = {
        ["User-Agent"] = "MakalHubExecutor"
    }
})

local token = hs:JSONDecode(init.Body).token
assert(token, "Token not received")

local script = http({
    Url = ("https://makalhub.vercel.app/api/script/%s?token=%s"):format(name, hs:UrlEncode(token)),
    Method = "GET",
    Headers = {
        ["User-Agent"] = "MakalHubExecutor"
    }
})

assert(script.StatusCode == 200, "Failed to fetch script")
loadstring(script.Body)()
