"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavLinks } from "./nav-links"
import { cn } from "@/lib/utils"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { SignOutButton } from "@/components/auth/sign-out-button"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState<boolean>(false)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    
    // Check if Supabase client exists before using it
    if (!supabase) {
      console.warn('Supabase client not available. Auth features disabled.')
      return
    }
    
    supabase.auth.getUser().then(({ data }) => setIsAuthed(!!data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
            SH
          </span>
          <span className="font-semibold">Secure Health</span>
          <span className="sr-only">Secure Health home</span>
        </Link>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <Link href="/dashboard" className="hidden md:inline-flex">
                <Button size="sm" variant="secondary">
                  Dashboard
                </Button>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden md:inline-flex">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up" className="hidden md:inline-flex">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
          <button
            aria-label="Toggle menu"
            className={cn(
              "inline-flex items-center justify-center rounded-md p-2 md:hidden",
              open ? "bg-muted" : "hover:bg-muted",
            )}
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <NavLinks className="flex-col items-start gap-2" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {isAuthed ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full" variant="secondary">
                      Dashboard
                    </Button>
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    <Button className="w-full" variant="ghost">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setOpen(false)}>
                    <Button className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
