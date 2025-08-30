export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    const filename = (form.get("filename") as string) || "record.enc"

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), { status: 400 })
    }

    // For Netlify deployment, we'll redirect to the Netlify function
    // The actual file handling will be done by the Netlify function
    const formData = new FormData()
    formData.append("file", file)
    formData.append("filename", filename)

    // Call the Netlify function
    const response = await fetch('/.netlify/functions/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return Response.json(result)
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Upload failed" }), { status: 500 })
  }
}
