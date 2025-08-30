import { createBrowserClient } from "@supabase/ssr"

let _browser: ReturnType<typeof createBrowserClient<typeof import("@supabase/ssr").SupabaseClient>> | null = null

export function getSupabaseBrowser() {
  if (_browser) return _browser
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Auth will not work.')
    // Return a mock client to prevent crashes
    return null
  }
  
  _browser = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return _browser
}
