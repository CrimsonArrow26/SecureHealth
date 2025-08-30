import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { baseUrl } = await req.json()
    if (!baseUrl || typeof baseUrl !== "string") {
      return NextResponse.json({ error: "baseUrl required" }, { status: 400 })
    }
    const base = baseUrl.replace(/\/+$/, "")
    // Try SMART well-known; many servers expose this.
    const wellKnown = `${base}/.well-known/smart-configuration`
    const cfgRes = await fetch(wellKnown, { cache: "no-store" })
    if (!cfgRes.ok) {
      // Fallback: some servers embed within metadata's rest.security.extension
      const metaRes = await fetch(`${base}/metadata`, {
        headers: { accept: "application/fhir+json" },
        cache: "no-store",
      })
      if (!metaRes.ok) {
        return NextResponse.json(
          { error: `SMART config not found (${cfgRes.status}); metadata fetch ${metaRes.status}` },
          { status: 502 },
        )
      }
      const metadata = await metaRes.json()
      // Best-effort parse
      const rest = metadata?.rest?.[0]?.security?.extension?.find(
        (e: any) => e.url?.includes("smart") || e.url?.includes("oauth-uris"),
      )
      const uris = rest?.extension?.reduce(
        (acc: any, x: any) => {
          if (x.url && x.valueUri) acc[x.url] = x.valueUri
          return acc
        },
        {} as Record<string, string>,
      )
      const auth = uris?.authorize || uris?.authorization_endpoint
      const token = uris?.token || uris?.token_endpoint
      if (!auth || !token) {
        return NextResponse.json({ error: "Could not derive SMART endpoints from metadata" }, { status: 502 })
      }
      return NextResponse.json({
        smart: {
          authorization_endpoint: auth,
          token_endpoint: token,
        },
      })
    }
    const smart = await cfgRes.json()
    return NextResponse.json({ smart })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load SMART config" }, { status: 500 })
  }
}
