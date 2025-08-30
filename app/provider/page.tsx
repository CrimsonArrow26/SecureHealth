import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProviderPortal() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-serif text-pretty text-2xl font-semibold text-foreground md:text-3xl">Provider Portal</h1>
        <p className="text-muted-foreground">
          View patient-shared records and audit trails after permission is granted.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="font-serif">Pending Access Requests</CardTitle>
            <CardDescription>Awaiting patient approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Patient: Jane Doe</p>
                  <p className="text-xs text-muted-foreground">Requested: MRI_Head_2023.pdf</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    Details
                  </Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Request Access</Button>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="font-serif">Recent Audit</CardTitle>
            <CardDescription>Transparent access history</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="rounded-md border border-border p-3">
                <p className="text-sm">You viewed “Bloodwork_2024.csv”</p>
                <p className="text-xs text-muted-foreground">1 day ago • signature verified</p>
              </li>
              <li className="rounded-md border border-border p-3">
                <p className="text-sm">Access request denied by patient</p>
                <p className="text-xs text-muted-foreground">3 days ago • consent respected</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
