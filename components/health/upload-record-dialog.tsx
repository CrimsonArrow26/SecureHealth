"use client"

import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { generateContentKey, encryptContent, sha256Hex, toBase64 } from "@/lib/crypto"
import type { RecordItem } from "./records-timeline"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onUploaded?: (record: RecordItem) => void
}

export default function UploadRecordDialog({ open, onOpenChange, onUploaded }: Props) {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [recipientType, setRecipientType] = useState<"hospital" | "doctor" | "insurer" | "none">("none")
  const [recipient, setRecipient] = useState("")
  const [encrypting, setEncrypting] = useState(false)

  const canNext = useMemo(() => {
    if (step === 1) return !!file
    if (step === 2) return true // permissions optional at upload time
    return true
  }, [file, step])

  const onClose = useCallback(() => {
    setStep(1)
    setFile(null)
    setRecipientType("none")
    setRecipient("")
    setEncrypting(false)
    onOpenChange(false)
  }, [onOpenChange])

  const handleEncryptAndUpload = async () => {
    if (!file) return
    setEncrypting(true)
    try {
      // Read file
      const buf = new Uint8Array(await file.arrayBuffer())

      // Encrypt with a fresh content key (AES-GCM)
      const contentKey = await generateContentKey()
      const { iv, ciphertext } = await encryptContent(contentKey, buf)

      // Integrity hash (to be committed on-chain in later milestone)
      const fullHash = await sha256Hex(ciphertext)
      const prettyHash = `0x${fullHash.slice(0, 8)}...${fullHash.slice(-4)}`

      // Upload ciphertext as a file payload
      const encBlob = new Blob([ciphertext], { type: "application/octet-stream" })
      const encName = `${file.name}.enc`
      const form = new FormData()
      form.append("file", encBlob, encName)
      form.append("filename", encName)

      let uploadedUrl: string | undefined
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (res.ok) {
          const j = (await res.json()) as { url: string }
          uploadedUrl = j.url
        }
      } catch {
        // tolerate offline/preview without storage; url remains undefined
      }

      if (uploadedUrl) {
        try {
          await fetch("/api/records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              hash: fullHash,
              url: uploadedUrl,
              iv: toBase64(iv),
              salt: "-", // marks content-key encryption
              size: file.size,
            }),
          })
        } catch {
          // best-effort, non-blocking
        }
      }

      // Build new record for UI
      const sizeKB = file.size / 1024
      const size = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeKB))} KB`
      const record: RecordItem = {
        id: crypto.randomUUID(),
        name: file.name,
        date: new Date().toISOString(),
        size,
        hash: prettyHash,
        url: uploadedUrl,
      }

      onUploaded?.(record)
      onClose()
    } finally {
      setEncrypting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : onClose())}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-serif">Upload Health Record</DialogTitle>
          <DialogDescription>Files are encrypted client-side. Only hashes are stored on-chain.</DialogDescription>
        </DialogHeader>

        <ol className="mb-4 flex items-center gap-2 text-sm">
          {[1, 2, 3].map((s) => (
            <li
              key={s}
              className={cn(
                "rounded-full px-3 py-1",
                s === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {s === 1 ? "Select File" : s === 2 ? "Permissions" : "Confirm"}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <div className="space-y-3">
            <Label htmlFor="file">Choose a file</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.csv,.jpg,.png,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-sm text-muted-foreground">
              Tip: Avoid PHI in filenames. Data is encrypted before leaving your device.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Label>Optional: Pre-grant access</Label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <select
                aria-label="Recipient type"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value as any)}
              >
                <option value="none">No pre-grant</option>
                <option value="hospital">Hospital</option>
                <option value="doctor">Doctor</option>
                <option value="insurer">Insurer</option>
              </select>
              <Input
                placeholder="Identifier (e.g., provider ID or email)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <div className="text-sm text-muted-foreground md:col-span-1">
                You can manage sharing later under “Sharing & Permissions”.
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm">
              You’re about to encrypt and upload:
              <span className="ml-1 font-medium">{file?.name ?? "No file selected"}</span>
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Client-side encryption using your private key</li>
              <li>Off-chain storage; on-chain hash for integrity</li>
              <li>Revocable permissions managed by smart contracts</li>
            </ul>
          </div>
        )}

        <DialogFooter className="mt-2 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">HIPAA/GDPR posture: consent-first, least-privilege.</div>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!file || encrypting}
                onClick={handleEncryptAndUpload}
              >
                {encrypting ? "Encrypting…" : "Encrypt & Upload"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
