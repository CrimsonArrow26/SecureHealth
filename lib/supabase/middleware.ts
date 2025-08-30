import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value)
          response = NextResponse.next({ request })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          request.cookies.set(name, '', { ...options, maxAge: 0 })
          response = NextResponse.next({ request })
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    },
  )

  // IMPORTANT: keep this call to stabilize sessions
  await supabase.auth.getUser()

  return response
}
