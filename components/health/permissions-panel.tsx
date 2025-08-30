"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Grant = { id: string; type: "hospital" | "doctor" | "insurer"; subject: string }

export default function PermissionsPanel() {
  const [grants, setGrants] = useState<Grant[]>([
    { id: "g1", type: "doctor", subject: "Dr. Lee (NPI 1234567890)" },
    { id: "g2", type: "hospital", subject: "Elm Street Hospital (OrgID 99887)" },
  ])

  const [type, setType] = useState<Grant["type"]>("doctor")
  const [subject, setSubject] = useState("")

  const addGrant = () => {
    if (!subject.trim()) return
    setGrants((gs) => [{ id: crypto.randomUUID(), type, subject: subject.trim() }, ...gs])
    setSubject("")
  }

  const revoke = (id: string) => {
    setGrants((gs) => gs.filter((g) => g.id !== id))
  }

  const section = (t: Grant["type"]) => grants.filter((g) => g.type === t)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          aria-label="Recipient type"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as Grant["type"])}
        >
          <option value="hospital">Hospital</option>
          <option value="doctor">Doctor</option>
          <option value="insurer">Insurer</option>
        </select>
        <Input
          placeholder="Identifier (e.g., NPI, Org ID, email)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={addGrant}>
          Grant Access
        </Button>
      </div>

      <Accordion type="multiple" className="w-full">
        {(["hospital", "doctor", "insurer"] as const).map((k) => (
          <AccordionItem key={k} value={k}>
            <AccordionTrigger className="font-serif capitalize">{k}s</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3">
                {section(k).length === 0 && <li className="text-sm text-muted-foreground">No {k} access granted.</li>}
                {section(k).map((g) => (
                  <li key={g.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <span className="text-sm">{g.subject}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        View Audit
                      </Button>
                      <Button variant="destructive" onClick={() => revoke(g.id)}>
                        Revoke
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-xs text-muted-foreground">
        Note: In production, grants are enforced by smart contracts and recorded on-chain.
      </p>
    </div>
  )
}
