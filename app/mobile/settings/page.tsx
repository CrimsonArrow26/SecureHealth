export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-20 pt-6">
      <h1 className="font-serif text-xl font-semibold">Settings</h1>
      <ul className="mt-3 space-y-2 text-sm">
        <li>Privacy: Consent-first</li>
        <li>Encryption: Client-side</li>
        <li>Storage: Off-chain (hash on-chain)</li>
      </ul>
    </main>
  )
}
