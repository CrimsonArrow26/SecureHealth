import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { baseUrl } = await req.json()
    if (!baseUrl || typeof baseUrl !== "string") {
      return NextResponse.json({ error: "baseUrl required" }, { status: 400 })
    }
    const url = baseUrl.replace(/\/+$/, "") + "/metadata"
    const r = await fetch(url, { headers: { accept: "application/fhir+json" }, cache: "no-store" })
    if (!r.ok) {
      return NextResponse.json({ error: `Fetch failed (${r.status})` }, { status: r.status })
    }
    const json = await r.json()
    return NextResponse.json({ metadata: json })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch metadata" }, { status: 500 })
  }
}
