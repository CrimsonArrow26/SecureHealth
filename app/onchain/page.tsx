import { OnchainCommitForm } from "@/components/onchain/commit-form"

export const dynamic = "force-dynamic"

export default function OnchainPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Smart Contracts & On‑Chain Audit</h1>
        <p className="text-muted-foreground">
          Commit record integrity hashes and manage permission events on-chain. Use your wallet to submit transactions.
          No personal health information is stored on-chain—only hashes and events for auditability.
        </p>
      </div>
      <OnchainCommitForm />
    </main>
  )
}
