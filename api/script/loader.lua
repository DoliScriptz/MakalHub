local gameId = game.PlaceId
local http = (syn and syn.request) or (http and http.request) or request or http_request
assert(http, "Executor not supported")

local supportedGames = {
    [537413528] = "babft", -- Build A Boat
}

local name = supportedGames[gameId]
assert(name, "Game not supported")

local response = http({
    Url = "https://makalhub.vercel.app/api/script/" .. name,
    Method = "GET",
    Headers = {
        ["User-Agent"] = "MakalHubExecutor"
    }
})

assert(response.StatusCode == 200, "Failed to fetch script")
loadstring(response.Body)()
