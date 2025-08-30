"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function EhrCallbackPage() {
  const [status, setStatus] = React.useState<"idle" | "exchanging" | "done" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [tokens, setTokens] = React.useState<any | null>(null)

  React.useEffect(() => {
    const u = new URL(window.location.href)
    const code = u.searchParams.get("code")
    const state = u.searchParams.get("state")
    const expected = sessionStorage.getItem("smart_state")
    if (!code || !state || !expected || state !== expected) {
      setError("Invalid or missing authorization response")
      setStatus("error")
      return
    }
    const verifier = sessionStorage.getItem("smart_pkce_verifier") || ""
    const clientId = sessionStorage.getItem("smart_client_id") || ""
    const redirectUri = sessionStorage.getItem("smart_redirect_uri") || ""
    const tokenEndpoint = sessionStorage.getItem("smart_token_endpoint") || ""
    if (!verifier || !clientId || !redirectUri || !tokenEndpoint) {
      setError("Missing PKCE or SMART configuration")
      setStatus("error")
      return
    }
    ;(async () => {
      try {
        setStatus("exchanging")
        const resp = await fetch("/api/fhir/token", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            tokenEndpoint,
            code,
            codeVerifier: verifier,
            clientId,
            redirectUri,
          }),
          cache: "no-store",
        })
        const json = await resp.json()
        if (!resp.ok) {
          setError(json?.error || "Token exchange failed")
          setStatus("error")
          return
        }
        setTokens(json)
        // Store tokens client-side for demo; in production route through a confidential backend
        sessionStorage.setItem("smart_tokens", JSON.stringify(json))
        setStatus("done")
      } catch (e: any) {
        setError(e?.message || "Exchange error")
        setStatus("error")
      }
    })()
  }, [])

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-balance">EHR Authorization Result</CardTitle>
          <CardDescription className="text-muted-foreground">
            Tokens are stored only in this browser session for demo purposes. Do not share or expose them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm">Status: </span>
            <span className="text-sm font-medium">
              {status === "idle" && "Idle"}
              {status === "exchanging" && "Exchanging"}
              {status === "done" && "Done"}
              {status === "error" && "Error"}
            </span>
          </div>
          {tokens && (
            <>
              <Separator />
              <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-80">
                {JSON.stringify(tokens, null, 2)}
              </pre>
            </>
          )}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <a href="/ehr">Back to EHR</a>
            </Button>
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
