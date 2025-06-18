import { NextResponse } from 'next/server'

export function middleware(req) {
  const userAgent = req.headers.get("user-agent")
  if (userAgent !== "MakalHubExecutor") {
    return new NextResponse("Forbidden", { status: 403 })
  }
  return NextResponse.next()
}

// Apply to only /scripts/*
export const config = {
  matcher: ["/scripts/:path*"],
}
