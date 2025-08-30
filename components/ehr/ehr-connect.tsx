"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { buildAuthUrl, generatePkcePair, type SmartConfig } from "@/lib/smart"

type Step = "idle" | "discover" | "ready" | "redirecting" | "error"

export function EhrConnect() {
  const [baseUrl, setBaseUrl] = React.useState("")
  const [clientId, setClientId] = React.useState("")
  const [redirectUri, setRedirectUri] = React.useState("")
  const [scope, setScope] = React.useState("launch/patient patient/*.read openid fhirUser offline_access")
  const [aud, setAud] = React.useState<string>("")
  const [smart, setSmart] = React.useState<SmartConfig | null>(null)
  const [metadata, setMetadata] = React.useState<any | null>(null)
  const [state, setState] = React.useState<Step>("idle")
  const [err, setErr] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!redirectUri) {
      setRedirectUri(`${window.location.origin}/ehr/callback`)
    }
  }, [redirectUri])

  async function discover() {
    try {
      setErr(null)
      setState("discover")
      const [metaRes, smartRes] = await Promise.all([
        fetch("/api/fhir/metadata", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ baseUrl }),
          cache: "no-store",
        }),
        fetch("/api/fhir/smart-config", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ baseUrl }),
          cache: "no-store",
        }),
      ])
      if (!metaRes.ok) throw new Error("Failed to load CapabilityStatement")
      if (!smartRes.ok) throw new Error("Failed to load SMART configuration")
      const meta = await metaRes.json()
      const sc = await smartRes.json()
      setMetadata(meta.metadata)
      setSmart(sc.smart)
      setAud(baseUrl)
      setState("ready")
    } catch (e: any) {
      setErr(e?.message || "Discovery failed")
      setState("error")
    }
  }

  async function launch() {
    if (!smart?.authorization_endpoint) return
    setState("redirecting")
    // PKCE
    const { verifier, challenge } = await generatePkcePair()
    const stateValue = crypto.randomUUID()
    // Persist transient values for callback
    sessionStorage.setItem("smart_pkce_verifier", verifier)
    sessionStorage.setItem("smart_state", stateValue)
    sessionStorage.setItem("smart_client_id", clientId)
    sessionStorage.setItem("smart_redirect_uri", redirectUri)
    sessionStorage.setItem("smart_token_endpoint", smart.token_endpoint || "")
    sessionStorage.setItem("smart_aud", aud || "")

    const url = buildAuthUrl({
      authorizationEndpoint: smart.authorization_endpoint,
      clientId,
      redirectUri,
      scope,
      state: stateValue,
      codeChallenge: challenge,
      aud,
    })
    window.location.href = url
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-balance">Connect to EHR (SMART on FHIR)</CardTitle>
        <CardDescription className="text-muted-foreground">
          Discover a FHIR server, review capabilities, and initiate a consent-first SMART OAuth flow using PKCE.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {state === "idle" && "Idle"}
            {state === "discover" && "Discovering"}
            {state === "ready" && "Ready"}
            {state === "redirecting" && "Redirecting"}
            {state === "error" && "Error"}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="base">FHIR Base URL</Label>
            <Input
              id="base"
              placeholder="https://sandbox.example.com/fhir"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Point to a SMART-enabled FHIR server (R4/R4B/R5).</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Client ID (public)</Label>
            <Input
              id="client"
              placeholder="your-public-client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Use a public client with PKCE for this demo.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="redirect">Redirect URI</Label>
            <Input
              id="redirect"
              placeholder="https://your.app/ehr/callback"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Must be registered with the EHR authorization server.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scope">Scopes</Label>
            <Input id="scope" value={scope} onChange={(e) => setScope(e.target.value)} />
            <p className="text-sm text-muted-foreground">
              Example: launch/patient patient/*.read openid fhirUser offline_access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={discover} disabled={!baseUrl || state === "discover"}>
            Discover Server
          </Button>
          <Button
            onClick={launch}
            disabled={!smart?.authorization_endpoint || !clientId || !redirectUri || state === "redirecting"}
          >
            Authorize with EHR
          </Button>
        </div>

        {smart && (
          <>
            <Separator />
            <div className="grid gap-2">
              <p className="text-sm font-medium">SMART Endpoints</p>
              <Item label="Authorization" value={smart.authorization_endpoint} />
              <Item label="Token" value={smart.token_endpoint} />
            </div>
          </>
        )}

        {metadata && (
          <>
            <Separator />
            <div className="grid gap-2">
              <p className="text-sm font-medium">CapabilityStatement (excerpt)</p>
              <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-64">
                {JSON.stringify(
                  {
                    fhirVersion: metadata?.metadata?.fhirVersion || metadata?.fhirVersion,
                    format: metadata?.metadata?.format || metadata?.format,
                    restSecurity: metadata?.metadata?.rest?.[0]?.security || metadata?.rest?.[0]?.security,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </>
        )}

        {err && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {err}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Item({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="grid gap-2 md:grid-cols-[160px_1fr]">
      <div className="text-sm font-medium">{label}</div>
      <code className="text-xs break-all rounded bg-muted px-2 py-1 text-muted-foreground">{value}</code>
    </div>
  )
}
