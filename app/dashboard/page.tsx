import PatientDashboard from "@/components/health/patient-dashboard"
import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function DashboardPage() {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/sign-in")
  }
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-pretty">Your Health Records</h1>
          <SignOutButton />
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Upload encrypted records, manage permissions, and view your audit history.
        </p>
        <PatientDashboard />
      </div>
    </main>
  )
}
