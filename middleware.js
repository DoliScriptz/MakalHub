import { NextResponse } from 'next/server'

export function middleware(req) {
  const ua = req.headers.get('user-agent')
  const url = req.nextUrl

  if (url.pathname.startsWith('/api/script/')) {
    if (ua !== 'MakalHubExecutor') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return NextResponse.next()
}
