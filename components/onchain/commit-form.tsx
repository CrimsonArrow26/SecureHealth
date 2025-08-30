"use client"

import * as React from "react"
import { createWalletClient, custom } from "viem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { healthRecordRegistryAbi } from "@/lib/abi/health-record-registry"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type TxState = "idle" | "preparing" | "confirming" | "done" | "error"

function useInjectedWallet() {
  const [address, setAddress] = React.useState<`0x${string}` | null>(null)
  const [chainId, setChainId] = React.useState<number | null>(null)

  async function connect() {
    const eth = (globalThis as any).ethereum
    if (!eth) throw new Error("No injected wallet found. Install MetaMask or a compatible wallet.")
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
    const a = accounts?.[0] as `0x${string}`
    const id: string = await eth.request({ method: "eth_chainId" })
    setAddress(a)
    setChainId(Number.parseInt(id, 16))
    return { address: a, chainId: Number.parseInt(id, 16) }
  }

  return {
    address,
    chainId,
    connect,
    getWalletClient() {
      const eth = (globalThis as any).ethereum
      if (!eth) throw new Error("No injected wallet")
      return createWalletClient({ transport: custom(eth) })
    },
  }
}

export function OnchainCommitForm() {
  const wallet = useInjectedWallet()
  const [contract, setContract] = React.useState<`0x${string}` | "">("")
  const [recordHashHex, setRecordHashHex] = React.useState("")
  const [status, setStatus] = React.useState<TxState>("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null)

  const [grantee, setGrantee] = React.useState<`0x${string}` | "">("")
  const [expiryISO, setExpiryISO] = React.useState<string>("") // optional

  const canCommit = Boolean(wallet.address && isBytes32(recordHashHex) && isAddress(contract))
  const canGrant = Boolean(wallet.address && isBytes32(recordHashHex) && isAddress(contract) && isAddress(grantee))

  function isAddress(v: string): v is `0x${string}` {
    return /^0x[a-fA-F0-9]{40}$/.test(v)
  }
  function isBytes32(v: string) {
    return /^0x[a-fA-F0-9]{64}$/.test(v)
  }

  async function ensureConnected() {
    if (!wallet.address) {
      await wallet.connect()
    }
  }

  async function commit() {
    try {
      setStatus("preparing")
      setError(null)
      await ensureConnected()
      const wc = wallet.getWalletClient()
      const hash: `0x${string}` = recordHashHex as any
      const addr: `0x${string}` = contract as any
      const tx = await wc.writeContract({
        address: addr,
        abi: healthRecordRegistryAbi,
        functionName: "commitRecord",
        args: [hash],
        chain: undefined,
        account: wallet.address,
      })
      setStatus("confirming")
      setTxHash(tx)
      setStatus("done")
    } catch (e: any) {
      setError(e?.message || "Commit failed")
      setStatus("error")
    }
  }

  async function grant() {
    try {
      setStatus("preparing")
      setError(null)
      await ensureConnected()
      const wc = wallet.getWalletClient()
      const addr: `0x${string}` = contract as any
      const hash: `0x${string}` = recordHashHex as any
      let expiry = 0n
      if (expiryISO) {
        const ts = Math.floor(new Date(expiryISO).getTime() / 1000)
        if (!Number.isFinite(ts) || ts <= 0) throw new Error("Invalid expiry datetime")
        expiry = BigInt(ts)
      }
      const tx = await wc.writeContract({
        address: addr,
        abi: healthRecordRegistryAbi,
        functionName: "grantAccess",
        args: [grantee as `0x${string}`, hash, expiry],
        chain: undefined,
        account: wallet.address,
      })
      setStatus("confirming")
      setTxHash(tx)
      setStatus("done")
    } catch (e: any) {
      setError(e?.message || "Grant failed")
      setStatus("error")
    }
  }

  async function revoke() {
    try {
      setStatus("preparing")
      setError(null)
      await ensureConnected()
      const wc = wallet.getWalletClient()
      const addr: `0x${string}` = contract as any
      const hash: `0x${string}` = recordHashHex as any
      const tx = await wc.writeContract({
        address: addr,
        abi: healthRecordRegistryAbi,
        functionName: "revokeAccess",
        args: [grantee as `0x${string}`, hash],
        chain: undefined,
        account: wallet.address,
      })
      setStatus("confirming")
      setTxHash(tx)
      setStatus("done")
    } catch (e: any) {
      setError(e?.message || "Revoke failed")
      setStatus("error")
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-balance">On‑Chain Registry</CardTitle>
        <CardDescription className="text-muted-foreground">
          Commit record hashes and manage permission events on your preferred EVM chain. Your wallet executes the
          transaction; no PHI is sent on‑chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {status === "idle" && "Idle"}
              {status === "preparing" && "Preparing"}
              {status === "confirming" && "Confirming"}
              {status === "done" && "Done"}
              {status === "error" && "Error"}
            </Badge>
            {wallet.address ? (
              <span className="text-sm text-muted-foreground">Connected: {short(wallet.address)}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Wallet not connected</span>
            )}
          </div>
          <Button variant="secondary" onClick={() => wallet.connect()}>
            {wallet.address ? "Reconnect Wallet" : "Connect Wallet"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contract">Contract address</Label>
            <Input
              id="contract"
              placeholder="0x…"
              value={contract}
              onChange={(e) => setContract(e.target.value as any)}
            />
            <p className="text-sm text-muted-foreground">Deploy HealthRecordRegistry and paste its address here.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hash">Record hash (bytes32 hex)</Label>
            <Input
              id="hash"
              placeholder="0x…64 hex chars…"
              value={recordHashHex}
              onChange={(e) => setRecordHashHex(normalizeHex(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Use the ciphertext SHA‑256 (padded to bytes32) or any integrity hash.
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="commit">
            <AccordionTrigger>Commit Record Hash</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Writes a RecordCommitted event and marks ownership of the hash to your address.
              </p>
              <Button onClick={commit} disabled={!canCommit}>
                Commit Hash
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="grant">
            <AccordionTrigger>Grant Access</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grantee">Grantee address</Label>
                  <Input
                    id="grantee"
                    placeholder="0x…"
                    value={grantee}
                    onChange={(e) => setGrantee(e.target.value as any)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry (optional)</Label>
                  <Input
                    id="expiry"
                    type="datetime-local"
                    value={expiryISO}
                    onChange={(e) => setExpiryISO(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Sets an expiry (unix seconds). Leave empty for immediate revoke semantics via Revoke Access.
              </p>
              <Button onClick={grant} disabled={!canGrant}>
                Grant Access
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="revoke">
            <AccordionTrigger>Revoke Access</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="grantee2">Grantee address</Label>
                <Input
                  id="grantee2"
                  placeholder="0x…"
                  value={grantee}
                  onChange={(e) => setGrantee(e.target.value as any)}
                />
              </div>
              <Button variant="destructive" onClick={revoke} disabled={!canGrant}>
                Revoke Access
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {txHash && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm font-medium">Transaction submitted</p>
              <code className="text-xs break-all rounded bg-muted px-2 py-1 text-muted-foreground">{txHash}</code>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function normalizeHex(v: string) {
  let x = v.trim()
  if (!x.startsWith("0x")) x = "0x" + x
  return x.toLowerCase()
}

function short(addr: `0x${string}`) {
  return `${addr.slice(0, 6)}…${addr.slice(38)}`
}
