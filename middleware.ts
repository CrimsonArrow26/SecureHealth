import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  // Skip middleware in static export builds
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: CookieOptions) => {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 })
        },
      },
    },
  )

  // Touch session so it refreshes when close to expiring
  await supabase.auth.getSession()
  return res
}

// Optional: protect specific routes by enabling matcher
export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/onchain/:path*", "/ehr/:path*"],
}
