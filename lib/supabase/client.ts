import { createBrowserClient } from "@supabase/ssr"

let _browser: ReturnType<typeof createBrowserClient<typeof import("@supabase/supabase-js").SupabaseClient>> | null =
  null

export function getSupabaseBrowser() {
  if (_browser) return _browser
  _browser = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  return _browser
}
