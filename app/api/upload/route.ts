import { put } from "@vercel/blob"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    const filename = (form.get("filename") as string) || "record.enc"

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), { status: 400 })
    }

    // Store encrypted payload with unique filename to avoid conflicts
    const { url } = await put(filename, file, { 
      access: "public",
      addRandomSuffix: true 
    })
    return Response.json({ url })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Upload failed" }), { status: 500 })
  }
}
