import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { getAuditTrail, CONTRACT_ADDRESS } from "@/lib/blockchain/contract"

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
    const recordHash = searchParams.get('recordHash')
    const userAddress = searchParams.get('userAddress')

    // Get real audit trail from smart contract
    let blockchainAuditTrail = []
    
    try {
      if (recordHash) {
        blockchainAuditTrail = await getAuditTrail(recordHash)
      } else {
        // For now, get audit trail for a sample record hash
        // In production, you'd query all records and get their audit trails
        blockchainAuditTrail = await getAuditTrail("0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890")
      }
    } catch (contractError) {
      console.error("Smart contract error:", contractError)
      // Fallback to empty array if contract call fails
      blockchainAuditTrail = []
    }

    // Transform blockchain data to match frontend expectations
    const transformedTrail = blockchainAuditTrail.map((entry: any) => ({
      auditId: entry.auditId || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      actor: entry.actor || "0x0000000000000000000000000000000000000000",
      action: entry.action || "UNKNOWN",
      recordHash: entry.recordHash || "0x0000000000000000000000000000000000000000000000000000000000000000",
      timestamp: entry.timestamp ? Number(entry.timestamp) * 1000 : Date.now(), // Convert from seconds to milliseconds
      metadata: entry.metadata || "Blockchain event",
      userIdentity: {
        name: getActorName(entry.actor),
        type: getActorType(entry.actor),
        organization: getOrganization(entry.actor)
      },
      recordName: getRecordName(entry.recordHash),
      blockchainVerified: true
    }))

    // If no blockchain data, provide some sample data for demonstration
    if (transformedTrail.length === 0) {
      transformedTrail.push({
        auditId: "demo_001",
        actor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        action: "RECORD_VIEWED",
        recordHash: "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        metadata: "Viewed by Dr. Sarah Lee",
        userIdentity: {
          name: "Dr. Sarah Lee",
          type: "Physician",
          organization: "City General Hospital"
        },
        recordName: "MRI_Head_2023.pdf",
        blockchainVerified: false,
        note: "Demo data - no blockchain events yet"
      })
    }

    return NextResponse.json({ 
      auditTrail: transformedTrail,
      contractAddress: CONTRACT_ADDRESS,
      blockchainNetwork: "Hardhat Local",
      lastBlockNumber: "Latest",
      isRealData: transformedTrail.some((entry: any) => entry.blockchainVerified)
    })

  } catch (error: any) {
    console.error("Blockchain audit trail error:", error)
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch blockchain audit trail" }, 
      { status: 500 }
    )
  }
}

// Helper functions to map addresses to readable names
function getActorName(address: string): string {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "Unknown User"
  }
  
  const nameMap: Record<string, string> = {
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6": "Dr. Sarah Lee",
    "0x8ba1f109551bD432803012645Hac136c772c3c7b": "Elm Street Hospital",
    "0x1234567890123456789012345678901234567890": "Dr. Michael Chen"
  }
  return nameMap[address] || `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getActorType(address: string): string {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "Unknown"
  }
  
  if (address === "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6") return "Physician"
  if (address === "0x8ba1f109551bD432803012645Hac136c772c3c7b") return "Healthcare Organization"
  return "Healthcare Provider"
}

function getOrganization(address: string): string {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "Unknown Organization"
  }
  
  if (address === "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6") return "City General Hospital"
  if (address === "0x8ba1f109551bD432803012645Hac136c772c3c7b") return "Elm Street Medical Center"
  return "Healthcare Organization"
}

function getRecordName(hash: string): string {
  if (!hash || hash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return "Unknown File"
  }
  
  // In production, this would query your records table
  const recordMap: Record<string, string> = {
    "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890": "MRI_Head_2023.pdf",
    "0xdef456abc7890123456789abcdef0123456789abcdef0123456789abcdef0123": "Bloodwork_2024.csv"
  }
  return recordMap[hash] || "Health Record"
}
