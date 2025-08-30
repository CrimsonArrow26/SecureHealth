export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-pretty">About Secure Health</h1>
      <p className="mt-4 text-muted-foreground">
        We empower patients to control their health data with client‑side encryption, permissioned access, and
        verifiable audit trails anchored on‑chain.
      </p>
      <p className="mt-4">
        Our platform is designed to support HIPAA/GDPR postures and interoperates with EHRs via SMART on FHIR.
      </p>
    </div>
  )
}
