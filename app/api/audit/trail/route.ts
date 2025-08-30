import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const recordId = searchParams.get('recordId')
    const userEmail = searchParams.get('userEmail')

    // Fetch real audit trail from database
    let query = supabase
      .from('audit_trail')
      .select(`
        *,
        records!inner(name, hash)
      `)
      .order('accessed_at', { ascending: false })

    if (recordId) {
      // Get audit trail for specific record
      query = query.eq('record_id', recordId)
    } else if (userEmail) {
      // Get audit trail for specific user
      query = query.eq('actor_email', userEmail)
    } else {
      // Get audit trail for records the current user owns
      query = query.eq('owner_email', user.email || '')
    }

    const { data: auditTrail, error } = await query

    if (error) {
      console.error("Failed to fetch audit trail:", error)
      return NextResponse.json({ error: "Failed to fetch audit trail" }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedTrail = auditTrail?.map((entry: any) => ({
      auditId: entry.id,
      actor: entry.actor_email,
      action: entry.action,
      recordHash: entry.record_hash,
      timestamp: new Date(entry.accessed_at).getTime(),
      metadata: entry.metadata,
      userIdentity: {
        name: entry.actor_name || entry.actor_email,
        type: getActorType(entry.actor_email),
        organization: getOrganization(entry.actor_email)
      },
      recordName: entry.records?.name || 'Unknown File'
    })) || []

    return NextResponse.json({ auditTrail: transformedTrail })

  } catch (error: any) {
    console.error("Audit trail error:", error)
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch audit trail" }, 
      { status: 500 }
    )
  }
}

// Helper function to determine actor type based on email
function getActorType(email: string): string {
  if (email.includes('doctor') || email.includes('dr.')) return 'Physician'
  if (email.includes('hospital') || email.includes('clinic')) return 'Healthcare Organization'
  if (email.includes('insurance') || email.includes('ins')) return 'Insurance Provider'
  if (email.includes('patient')) return 'Patient'
  return 'Healthcare Provider'
}

// Helper function to get organization name
function getOrganization(email: string): string {
  if (email.includes('doctor')) return 'City General Hospital'
  if (email.includes('hospital')) return 'Elm Street Medical Center'
  if (email.includes('insurance')) return 'Blue Cross Health Services'
  return 'Healthcare Organization'
}
