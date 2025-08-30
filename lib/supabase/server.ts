import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

let _server: ReturnType<typeof createServerClient<typeof import("@supabase/supabase-js").SupabaseClient>> | null = null

export async function getSupabaseServer() {
  if (_server) return _server
  const cookieStore = await cookies()
  _server = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      async get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // handled in middleware; no-op here
      },
      remove(name: string, options: CookieOptions) {
        // handled in middleware; no-op here
      },
    },
  })
  return _server
}
