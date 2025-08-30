export default function FeaturesPage() {
  const features = [
    { title: "End‑to‑End Encryption", body: "Encrypt on device with AES‑GCM; keys never leave your control." },
    { title: "Permissioned Sharing", body: "Grant or revoke access with smart contracts and key exchanges." },
    { title: "On‑Chain Audit", body: "Commit hashes to an immutable registry for auditability." },
    { title: "Off‑Chain Storage", body: "Store large encrypted files; keep only integrity hashes on‑chain." },
    { title: "EHR Interop", body: "Connect to hospital systems using SMART on FHIR with consent." },
    { title: "Mobile PWA", body: "Install on mobile and manage permissions on the go." },
  ]
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Features</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border bg-card p-5">
            <div className="font-medium">{f.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
