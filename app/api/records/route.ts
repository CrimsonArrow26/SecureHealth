import { getSupabaseServer } from "@/lib/supabase/server"

type InsertBody = {
  filename: string
  hash: string
  url: string
  iv: string
  salt: string
  size: number
}

function mapRowToUi(r: any) {
  const sizeKB = (r.size ?? 0) / 1024
  const size = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeKB))} KB`
  return {
    id: r.id,
    name: r.filename,
    date: r.created_at,
    size,
    hash: r.hash,
    url: r.url ?? undefined,
  }
}

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
    const ui = (data ?? []).map(mapRowToUi)
    return Response.json({ records: ui })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Failed to list records" }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = (await req.json()) as Partial<InsertBody>
    const { filename, hash, url, iv, salt, size } = body

    if (!filename || !hash || !url || !iv || !salt || typeof size !== "number") {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
    }

    const { data, error } = await supabase
      .from("records")
      .insert({
        user_id: user.id,
        filename,
        hash,
        url,
        iv,
        salt,
        size,
      } as any)
      .select("*")
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return Response.json({ record: mapRowToUi(data) })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Failed to insert record" }), { status: 500 })
  }
}
