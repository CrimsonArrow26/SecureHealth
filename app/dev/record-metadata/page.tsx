"use client"

import { useState } from "react"

export default function RecordMetadataDev() {
  const [msg, setMsg] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    filename: "",
    size: 0,
    hash: "",
    url: "",
    iv: "",
    salt: "",
  })

  async function submit() {
    setLoading(true)
    setMsg("")
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const j = await res.json()
    setLoading(false)
    setMsg(res.ok ? "Inserted!" : `Error: ${j.error}`)
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dev: Insert Record Metadata</h1>
      <div className="grid grid-cols-1 gap-3">
        {(["filename", "hash", "url", "iv", "salt"] as const).map((k) => (
          <input
            key={k}
            className="border rounded px-3 py-2"
            placeholder={k}
            value={(form as any)[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
        ))}
        <input
          className="border rounded px-3 py-2"
          placeholder="size"
          type="number"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: Number(e.target.value) })}
        />
      </div>
      <button onClick={submit} disabled={loading} className="bg-primary text-primary-foreground rounded px-4 py-2">
        {loading ? "Saving..." : "Save record"}
      </button>
      {msg && <p className="mt-3">{msg}</p>}
      <p className="text-sm text-muted-foreground mt-6">
        Note: You must be signed in to pass RLS. Use /sign-in or /sign-up first.
      </p>
    </main>
  )
}
