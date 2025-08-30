"use client"

import { useState } from "react"

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-2 text-muted-foreground">Have a question or want to partner? Send us a message.</p>
      {!sent ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="msg" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="msg"
              rows={5}
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-md border bg-muted p-4 text-sm">Thanks! We’ll get back to you shortly.</div>
      )}
    </div>
  )
}
