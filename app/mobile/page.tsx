"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UploadRecordDialog from "@/components/health/upload-record-dialog"
import RecordsTimeline, { type RecordItem } from "@/components/health/records-timeline"
import PermissionsPanel from "@/components/health/permissions-panel"
import MobileNav from "@/components/mobile/mobile-nav"
import { usePWAInstall } from "@/hooks/use-pwa-install"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MobileHome() {
  const [openUpload, setOpenUpload] = useState(false)
  const { canInstall, installed, promptInstall } = usePWAInstall()
  const { data, isLoading, mutate } = useSWR<{ records: RecordItem[] }>("/api/records", fetcher)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-20 pt-6">
      <header className="mb-4">
        <h1 className="font-serif text-pretty text-xl font-semibold">My Records</h1>
        <p className="text-sm text-muted-foreground">Upload, view, and manage sharing from your phone.</p>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <Button
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOpenUpload(true)}
        >
          Upload
        </Button>
        {canInstall && !installed && (
          <Button
            variant="secondary"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={() => promptInstall()}
          >
            Install
          </Button>
        )}
      </div>

      <section className="mb-4">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Recent</CardTitle>
            <CardDescription className="text-xs">Latest encrypted files</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : data?.records?.length ? (
              <ul className="divide-y divide-border">
                {data.records.slice(0, 4).map((rec) => (
                  <li key={rec.id} className="py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{rec.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rec.date).toLocaleDateString()} • {rec.size}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-foreground hover:bg-muted">
                        Actions
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No records yet.</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mb-4">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Timeline</CardTitle>
            <CardDescription className="text-xs">Chronological view</CardDescription>
          </CardHeader>
          <CardContent>
            <RecordsTimeline records={data?.records ?? []} />
          </CardContent>
        </Card>
      </section>

      <section className="mb-4">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Sharing</CardTitle>
            <CardDescription className="text-xs">Grant or revoke access</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionsPanel />
          </CardContent>
        </Card>
      </section>

      <UploadRecordDialog
        open={openUpload}
        onOpenChange={setOpenUpload}
        onUploaded={async () => {
          await mutate()
        }}
      />

      <MobileNav />
    </main>
  )
}
