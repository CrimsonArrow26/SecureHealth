"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import UploadRecordDialog from "./upload-record-dialog"
import RecordsTimeline, { type RecordItem } from "./records-timeline"
import PermissionsPanel from "./permissions-panel"
import KeyStatus from "@/components/health/key-status"

type AuditEntry = {
  auditId: string
  actor: string
  action: string
  recordHash: string
  timestamp: number
  metadata: string
  userIdentity: {
    name: string
    type: string
    organization?: string
  }
  recordName?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PatientDashboard() {
  const { data, isLoading, mutate } = useSWR<{ records: RecordItem[] }>("/api/records", fetcher)
  const { data: auditData, isLoading: auditLoading } = useSWR<{ auditTrail: AuditEntry[] }>("/api/audit/blockchain", fetcher)
  const [openUpload, setOpenUpload] = useState(false)

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getActionDisplay = (action: string, metadata: string, recordName?: string) => {
    switch (action) {
      case 'VIEW':
        return `viewed "${recordName || 'file'}"`
      case 'DOWNLOAD':
        return `downloaded "${recordName || 'file'}"`
      case 'GRANT_ACCESS':
        return `granted access to ${metadata.split(' ').slice(-1)[0]}`
      case 'REVOKE_ACCESS':
        return `revoked access from ${metadata.split(' ').slice(-1)[0]}`
      case 'COMMIT_RECORD':
        return 'committed record to blockchain'
      default:
        return metadata
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-serif text-pretty text-2xl font-semibold text-foreground md:text-3xl">
            Patient Health Records
          </h1>
          <p className="text-muted-foreground">
            Upload, view, and control sharing with hospitals, doctors, or insurers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setOpenUpload(true)}
          >
            Upload Record
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card text-card-foreground">
              <DropdownMenuItem onClick={() => mutate()}>Refresh Records</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
              >
                View Permissions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="font-serif">Recent Records</CardTitle>
            <CardDescription>Latest encrypted files you’ve added</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foregound">Loading…</div>
            ) : (
              <ul className="divide-y divide-border">
                {data?.records?.slice(0, 6).map((rec) => (
                  <li key={rec.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{rec.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(rec.date).toLocaleString()} • {rec.size}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-foreground hover:bg-muted">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card text-card-foreground">
                        <DropdownMenuItem onClick={() => alert(`Viewing ${rec.name}`)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Share ${rec.name}`)}>Share</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rec.hash)}>
                          Copy Hash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
                {!data?.records?.length && (
                  <li className="py-6 text-muted-foreground">No records yet. Upload your first record.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="font-serif">Audit Trail</CardTitle>
            <CardDescription>Who accessed what and when (Blockchain Verified)</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder audit items */}
            <ul className="space-y-3">
              <li className="rounded-md border border-border p-3">
                <p className="text-sm">Dr. Lee viewed “MRI_Head_2023.pdf”</p>
                <p className="text-xs text-muted-foreground">2 days ago • via granted permission</p>
              </li>
              <li className="rounded-md border border-border p-3">
                <p className="text-sm">Elm Street Hospital downloaded “Bloodwork_2024.csv”</p>
                <p className="text-xs text-muted-foreground">5 days ago • recorded on-chain</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="font-serif">Records Timeline</CardTitle>
            <CardDescription>Chronological view of your health data</CardDescription>
          </CardHeader>
          <CardContent>
            <RecordsTimeline records={data?.records ?? []} />
          </CardContent>
        </Card>
      </section>

      <section id="permissions" className="mt-8">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="font-serif">Sharing & Permissions</CardTitle>
            <CardDescription>Grant or revoke access for providers</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionsPanel />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <KeyStatus />
      </section>

      <UploadRecordDialog
        open={openUpload}
        onOpenChange={setOpenUpload}
        onUploaded={async (newRecord) => {
          await mutate(
            (prev) => {
              const records = prev?.records ? [newRecord, ...prev.records] : [newRecord]
              return { records }
            },
            { revalidate: false },
          )
        }}
      />
    </main>
  )
}
