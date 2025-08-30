export const dynamic = "force-dynamic"

import { EncryptUpload } from "@/components/encryption/encrypt-upload"

export default function UploadPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Secure Encrypted Upload</h1>
        <p className="text-muted-foreground">
          Encrypt health records in your browser, upload ciphertext to secure off‑chain storage, and keep the integrity
          hash for on‑chain audit later.
        </p>
      </div>
      <EncryptUpload />
    </main>
  )
}
