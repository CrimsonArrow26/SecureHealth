export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">
        We take privacy seriously. Patient records are encrypted on the client before upload; we never store unencrypted
        PHI.
      </p>
      <ul className="mt-4 list-disc pl-6 text-sm">
        <li>No sale of personal data</li>
        <li>Encryption at rest and in transit</li>
        <li>Patient‑controlled sharing</li>
      </ul>
    </div>
  )
}
