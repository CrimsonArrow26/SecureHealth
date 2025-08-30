import { EhrConnect } from "@/components/ehr/ehr-connect"

export const dynamic = "force-dynamic"

export default function EhrPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">EHR Interoperability (SMART on FHIR)</h1>
        <p className="text-muted-foreground">
          Connect to a SMART-enabled FHIR server, review capabilities, and authorize access with patient consent using
          PKCE.
        </p>
      </div>
      <EhrConnect />
    </main>
  )
}
