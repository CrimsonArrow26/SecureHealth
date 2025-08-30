import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-pretty text-4xl font-semibold leading-tight md:text-5xl">
            Secure, patient‑controlled health records
          </h1>
          <p className="mt-4 text-muted-foreground">
            Encrypt on your device, store off‑chain, and anchor integrity on‑chain. Share with hospitals, doctors, or
            insurers under your consent—audited and revocable.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/upload">
              <Button size="lg">Upload a record</Button>
            </Link>
            <Link href="/dashboard" className="inline-flex">
              <Button size="lg" variant="outline">
                Open dashboard
              </Button>
            </Link>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium">How it works</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Generate keys client‑side; your private key stays encrypted with your passphrase.</li>
            <li>Encrypt files locally with AES‑GCM; store ciphertext off‑chain in Blob.</li>
            <li>Commit content hashes on‑chain for immutable audit trails.</li>
            <li>Grant/revoke access at any time—provider access is evented and logged.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
