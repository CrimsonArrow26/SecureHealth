"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/mobile", label: "Records" },
  { href: "/mobile/share", label: "Share" },
  { href: "/mobile/settings", label: "Settings" },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      role="navigation"
      aria-label="Mobile"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1">
        {tabs.map((t) => {
          const active = pathname === t.href
          return (
            <li key={t.href} className="w-full">
              <Link
                href={t.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-center text-sm",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
