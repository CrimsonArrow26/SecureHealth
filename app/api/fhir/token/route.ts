import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { tokenEndpoint, code, codeVerifier, clientId, redirectUri, clientSecret } = await req.json()
    if (!tokenEndpoint || !code || !codeVerifier || !clientId || !redirectUri) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const body = new URLSearchParams()
    body.set("grant_type", "authorization_code")
    body.set("code", code)
    body.set("code_verifier", codeVerifier)
    body.set("client_id", clientId)
    body.set("redirect_uri", redirectUri)

    const headers: HeadersInit = { "content-type": "application/x-www-form-urlencoded" }
    if (clientSecret) {
      // Confidential client (not typical for SPA). Will depend on server policy.
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
      ;(headers as any).Authorization = `Basic ${basic}`
      body.delete("client_id")
    }

    const resp = await fetch(tokenEndpoint, { method: "POST", headers, body, cache: "no-store" })
    const json = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json({ error: "Token exchange failed", details: json }, { status: resp.status })
    }
    // Do not persist tokens server-side. Return the response for client storage.
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Token exchange error" }, { status: 500 })
  }
}
