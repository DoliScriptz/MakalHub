local http = (syn and syn.request) or (http and http.request) or request or http_request
assert(http, "Executor not supported")
local hs = game:GetService("HttpService")
local pl = game:GetService("Players").LocalPlayer
local gid = pl.PlaceId
local m = {
    [537413528] = "babft"
}
local name = m[gid]
assert(name, "Game not supported")
local initRes = http({
    Url = "https://makalhub.vercel.app/api/init?userid=" .. hs:UrlEncode(pl.UserId) .. "&username=" .. hs:UrlEncode(pl.Name),
    Method = "GET",
    Headers = { ["User-Agent"] = "MakalHubExecutor" }
})
local initData = hs:JSONDecode(initRes.Body)
assert(initData.token, "Init failed")
local scriptRes = http({
    Url = "https://makalhub.vercel.app/api/script/" .. name .. "?token=" .. hs:UrlEncode(initData.token),
    Method = "GET",
    Headers = { ["User-Agent"] = "MakalHubExecutor" }
})
assert(scriptRes.StatusCode == 200, "Failed to fetch script")
loadstring(scriptRes.Body)()
