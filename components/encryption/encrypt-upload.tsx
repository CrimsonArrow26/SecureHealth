"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { encryptWithPassphrase, sha256Hex, toBase64 } from "@/lib/crypto"

type UploadState = "idle" | "encrypting" | "uploading" | "done" | "error"

export function EncryptUpload() {
  const [file, setFile] = React.useState<File | null>(null)
  const [pass, setPass] = React.useState("")
  const [state, setState] = React.useState<UploadState>("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<{
    url: string
    hash: string
    iv: string
    salt: string
    name: string
    size: number
  } | null>(null)

  const canSubmit = !!file && pass.length >= 8 && state !== "encrypting" && state !== "uploading"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || pass.length < 8) return
    setError(null)
    setState("encrypting")
    try {
      const buf = await file.arrayBuffer()
      const { ciphertext, iv, salt } = await encryptWithPassphrase(pass, new Uint8Array(buf))
      const hash = await sha256Hex(ciphertext)
      const encFile = new File([ciphertext as BlobPart], `${file.name}.enc`, { type: "application/octet-stream" })

      setState("uploading")
      const fd = new FormData()
      fd.append("file", encFile)
      fd.append("hash", hash)
      fd.append("alg", "AES-GCM-256+PBKDF2")
      fd.append("iv", toBase64(iv))
      fd.append("salt", toBase64(salt))
      fd.append("originalName", file.name)

      const res = await fetch("/api/upload", { method: "POST", body: fd, cache: "no-store" })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Upload failed")
      }
      const json = (await res.json()) as { url: string }

      try {
        await fetch("/api/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            hash,
            url: json.url,
            iv: toBase64(iv),
            salt: toBase64(salt),
            size: file.size,
          }),
        })
      } catch {
        // swallow; DB persistence is best-effort
      }

      setResult({
        url: json.url,
        hash,
        iv: toBase64(iv),
        salt: toBase64(salt),
        name: file.name,
        size: file.size,
      })
      setState("done")
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
      setState("error")
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-balance">Encrypt & Upload Health Record</CardTitle>
        <CardDescription className="text-muted-foreground">
          Files are encrypted locally with your passphrase. Only ciphertext is uploaded. Store IV and salt safely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="file">Record file</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                aria-describedby="file-hint"
              />
              <p id="file-hint" className="text-sm text-muted-foreground">
                PDFs, images, or archives. Large files supported—only a hash goes on-chain later.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Passphrase (min 8 chars)</Label>
              <Input
                id="pass"
                type="password"
                minLength={8}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Create a strong passphrase"
              />
              <p className="text-sm text-muted-foreground">PBKDF2 + AES‑GCM key is derived in your browser.</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {state === "idle" && "Ready"}
                {state === "encrypting" && "Encrypting"}
                {state === "uploading" && "Uploading"}
                {state === "done" && "Uploaded"}
                {state === "error" && "Error"}
              </Badge>
              {file ? (
                <span className="text-sm text-muted-foreground">
                  {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No file selected</span>
              )}
            </div>
            <Button type="submit" disabled={!canSubmit}>
              {state === "encrypting" ? "Encrypting…" : state === "uploading" ? "Uploading…" : "Encrypt & Upload"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-md border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Upload complete</p>
                <p className="text-sm text-muted-foreground">{result.name}</p>
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm underline underline-offset-4"
              >
                Open Blob URL
              </a>
            </div>
            <Separator />
            <KeyVal label="Ciphertext SHA‑256" value={result.hash} />
            <KeyVal label="IV (base64)" value={result.iv} />
            <KeyVal label="Salt (base64)" value={result.salt} />
            <p className="text-sm text-muted-foreground">Store IV and salt securely. You’ll need them to decrypt.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function KeyVal({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 md:grid-cols-[200px_1fr]">
      <div className="text-sm font-medium">{label}</div>
      <code className="text-xs break-all rounded bg-muted px-2 py-1 text-muted-foreground">{value}</code>
    </div>
  )
}
