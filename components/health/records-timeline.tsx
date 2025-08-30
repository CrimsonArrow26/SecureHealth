"use client"

export type RecordItem = {
  id: string
  name: string
  date: string
  size: string
  hash: string
  url?: string
}

export default function RecordsTimeline({ records }: { records: RecordItem[] }) {
  const items = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (!items.length) {
    return <p className="text-muted-foreground">No records yet.</p>
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 h-full w-px bg-border" aria-hidden />
      <ul className="space-y-6">
        {items.map((r) => (
          <li key={r.id} className="relative pl-10">
            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-2 ring-ring" aria-hidden />
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{r.name}</h4>
                <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Size: {r.size}</p>
              <p className="truncate text-xs text-muted-foreground">Hash: {r.hash}</p>
              {r.url && (
                <p className="truncate text-xs text-muted-foreground">
                  URL:{" "}
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.url}
                  </a>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
