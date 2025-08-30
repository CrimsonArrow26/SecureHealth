"use client"

import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignOutButton() {
  const supabase = getSupabaseBrowser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Check if Supabase client is available
  if (!supabase) {
    return (
      <Button variant="outline" size="sm" disabled>
        Sign out
      </Button>
    )
  }

  async function signOut() {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
    router.push("/sign-in")
  }

  return (
    <Button variant="outline" size="sm" onClick={signOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  )
}
