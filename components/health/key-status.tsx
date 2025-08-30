"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { destroyKeyring, hasKeyring, loadPublicKey, setupKeyring, unlockPrivateKey } from "@/lib/keyring"

export default function KeyStatus() {
  const { toast } = useToast()
  const [exists, setExists] = useState<boolean>(false)
  const [fingerprint, setFingerprint] = useState<string>("")
  const [pubJwk, setPubJwk] = useState<JsonWebKey | null>(null)

  const [pass, setPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [busy, setBusy] = useState(false)
  const canSetup = useMemo(() => pass.length >= 8 && pass === confirmPass, [pass, confirmPass])

  async function refresh() {
    const has = hasKeyring()
    setExists(has)
    if (has) {
      const info = await loadPublicKey()
      setFingerprint(info?.fingerprint || "")
      setPubJwk(info?.pubJwk || null)
    } else {
      setFingerprint("")
      setPubJwk(null)
    }
  }

  useEffect(() => {
    // attempt to load on mount
    refresh()
  }, [])

  const onSetup = async () => {
    try {
      setBusy(true)
      const s = await setupKeyring(pass)
      setPass("")
      setConfirmPass("")
      await refresh()
      toast({ title: "Keys generated", description: `Fingerprint: ${s.fingerprint}`, variant: "success" })
    } catch (e: any) {
      toast({ title: "Failed to generate keys", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const onCopyPub = async () => {
    if (!pubJwk) return
    await navigator.clipboard.writeText(JSON.stringify(pubJwk))
          toast({ title: "Public key copied", description: "You can share this with providers to enable encryption.", variant: "success" })
  }

  const onRotate = async () => {
    if (!confirm("Rotate keys? Existing shares will require re-encryption of content keys.")) return
    destroyKeyring()
    await refresh()
          toast({ title: "Keys removed", description: "Generate new keys to continue.", variant: "success" })
  }

  const onTestUnlock = async () => {
    try {
      setBusy(true)
      await unlockPrivateKey(pass)
      toast({ title: "Private key unlocked", description: "Decryption is available for this session.", variant: "success" })
    } catch (e: any) {
      toast({ title: "Unlock failed", description: e?.message ?? "Wrong passphrase?", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="font-serif">Security & Keys</CardTitle>
        <CardDescription>
          Client-side RSA key pair for end-to-end encryption. Private key is passphrase-protected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {exists ? (
          <div className="space-y-2">
            <p className="text-sm">
              Status: <span className="rounded bg-muted px-2 py-0.5 text-foreground">Active • fp:{fingerprint}</span>
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="test-pass" className="text-sm">
                  Test passphrase unlock
                </Label>
                <Input 
                  id="test-pass" 
                  type="password" 
                  placeholder="Enter your passphrase to test unlock"
                  value={pass} 
                  onChange={(e) => setPass(e.target.value)} 
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90" 
                  onClick={onCopyPub}
                >
                  Copy Public Key
                </Button>
                <Button
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => refresh()}
                >
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  disabled={!pass || busy} 
                  onClick={onTestUnlock}
                >
                  Test Unlock
                </Button>
                <Button variant="destructive" onClick={onRotate}>
                  Rotate/Remove Keys
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="pass" className="text-sm">
                Create passphrase (min 8 chars)
              </Label>
              <Input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="confirm" className="text-sm">
                Confirm passphrase
              </Label>
              <Input id="confirm" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button disabled={!canSetup || busy} onClick={onSetup}>
                {busy ? "Setting up…" : "Generate Keys"}
              </Button>
              <span className={cn("text-xs text-muted-foreground")}>
                Tip: Store your passphrase safely. It cannot be recovered.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" disabled={!pass || busy} onClick={onTestUnlock}>
                Test Unlock
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
