import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { recordId, action, recordHash, ownerEmail } = body

    if (!recordId || !action || !recordHash || !ownerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the user has access to this record
    // In a real implementation, you'd check the smart contract permissions
    const { data: permissions, error: permError } = await supabase
      .from('record_permissions')
      .select('*')
      .eq('record_id', recordId)
      .eq('grantee_email', user.email || '')
      .single()

    if (permError || !permissions) {
      return NextResponse.json({ error: "Access denied - no permission" }, { status: 403 })
    }

    // Record the access event in the audit trail
    const { data: auditEntry, error: auditError } = await supabase
      .from('audit_trail')
      .insert({
        record_id: recordId,
        actor_email: user.email || '',
        actor_name: user.user_metadata?.full_name || user.email || '',
        action: action, // 'VIEW' or 'DOWNLOAD'
        record_hash: recordHash,
        owner_email: ownerEmail,
        accessed_at: new Date().toISOString(),
        metadata: `${action === 'VIEW' ? 'Viewed' : 'Downloaded'} file with granted permission`
      } as any)
      .select()
      .single()

    if (auditError) {
      console.error("Failed to create audit entry:", auditError)
      return NextResponse.json({ error: "Failed to record access event" }, { status: 500 })
    }

    // TODO: Call smart contract to record the event on blockchain
    // await contract.recordView(ownerAddress, recordHash, user.email)

    console.log(`Audit: ${user.email} ${action.toLowerCase()}ed record ${recordId} owned by ${ownerEmail}`)

    return NextResponse.json({ 
      success: true, 
      message: `${action} event recorded`,
      auditId: (auditEntry as any).id
    })

  } catch (error: any) {
    console.error("File access error:", error)
    return NextResponse.json(
      { error: error?.message ?? "Failed to record access event" }, 
      { status: 500 }
    )
  }
}
