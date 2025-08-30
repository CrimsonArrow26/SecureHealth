import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

let _server: ReturnType<typeof createServerClient<typeof import("@supabase/ssr").SupabaseClient>> | null = null

export async function getSupabaseServer() {
  if (_server) return _server
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Auth will not work.')
    // Return a mock client to prevent crashes
    return null
  }
  
  const cookieStore = await cookies()
  _server = createServerClient(supabaseUrl, supabaseAnonKey, {
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
