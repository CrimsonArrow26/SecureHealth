import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="mb-2 font-semibold">Secure Health</div>
          <p className="text-sm text-muted-foreground">
            Patient‑controlled, encrypted records with permissioned access and on‑chain audit.
          </p>
        </div>
        <div>
          <div className="mb-2 font-semibold">Product</div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/features" className="hover:underline">
                Features
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/upload" className="hover:underline">
                Upload
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-semibold">Company</div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Secure Health</span>
          <span>Built for privacy & interoperability</span>
        </div>
      </div>
    </footer>
  )
}
