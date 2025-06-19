local r = (syn and syn.request) or (http and http.request) or request or http_request
assert(r, "Executor not supported")
local h = game:GetService("HttpService")
local p = game:GetService("Players").LocalPlayer
local id = game.PlaceId
local g = {
	[537413528] = "babft"
}
local n = g[id]
assert(n, "Game not supported")
local i = r({
	Url = ("https://makalhub.vercel.app/api/init?userid=%s&username=%s"):format(p.UserId, h:UrlEncode(p.Name)),
	Method = "GET",
	Headers = {["User-Agent"] = "MakalHubExecutor"}
})
assert(i and i.Body, "Init request failed")
local t = h:JSONDecode(i.Body).token
assert(t, "Token missing")

local s = r({
	Url = "https://makalhub.vercel.app/api/script/" .. n .. "?token=" .. h:UrlEncode(t),
	Method = "GET",
	Headers = {["User-Agent"] = "MakalHubExecutor"}
})
assert(s and s.StatusCode == 200 and s.Body, "Failed to fetch script")
loadstring(s.Body)()
