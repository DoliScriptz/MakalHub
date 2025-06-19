local r=(syn and syn.request)or(http and http.request)or request or http_request
assert(r,"Executor not supported")
local H=game:GetService("HttpService")
local P=game.Players.LocalPlayer
local G=game.PlaceId
local M={[537413528]="babft"}
local N=M[G]
assert(N,"Game not supported")

local I=r{Url=("https://makalhub.vercel.app/api/init?userid=%d&username=%s"):format(P.UserId,H:UrlEncode(P.Name)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
assert(I and I.Body,"Init failed")
local T=H:JSONDecode(I.Body).token

local S=r{Url=("https://makalhub.vercel.app/scripts/"..N..".lua?token="..H:UrlEncode(T)),Method="GET",Headers={["User-Agent"]="MakalHubExecutor"}}
assert(S and S.Body,"Failed to fetch script")
loadstring(S.Body)()
