import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    if (req.nextUrl.pathname.startsWith('/admin') && !(token as any)?.isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const p = req.nextUrl.pathname
        if (p.startsWith('/predictions') || p.startsWith('/leaderboard') || p.startsWith('/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/predictions/:path*', '/leaderboard/:path*', '/admin/:path*'],
}
