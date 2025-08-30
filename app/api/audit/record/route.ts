import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { recordView, recordDownload, grantAccess, CONTRACT_ADDRESS } from "@/lib/blockchain/contract"
import { ethers } from 'ethers'

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
    const { action, recordHash, ownerAddress, viewerType, downloaderType, granteeAddress, expiry } = body

    if (!action || !recordHash || !ownerAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For demo purposes, we'll use a hardcoded private key
    // In production, you'd get this from environment variables or user wallet
    const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" // Hardhat account #0
    
    try {
      const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
      const signer = new ethers.Wallet(PRIVATE_KEY, provider)
      
      let transaction: any = null
      let contractCall = ""

      switch (action) {
        case 'VIEW':
          if (!viewerType) {
            return NextResponse.json({ error: "viewerType required for VIEW action" }, { status: 400 })
          }
          transaction = await recordView(ownerAddress, recordHash, viewerType, signer)
          contractCall = `recordView(${ownerAddress}, ${recordHash}, ${viewerType})`
          break
          
        case 'DOWNLOAD':
          if (!downloaderType) {
            return NextResponse.json({ error: "downloaderType required for DOWNLOAD action" }, { status: 400 })
          }
          transaction = await recordDownload(ownerAddress, recordHash, downloaderType, signer)
          contractCall = `recordDownload(${ownerAddress}, ${recordHash}, ${downloaderType})`
          break
          
        case 'GRANT_ACCESS':
          if (!granteeAddress || !expiry) {
            return NextResponse.json({ error: "granteeAddress and expiry required for GRANT_ACCESS action" }, { status: 400 })
          }
          transaction = await grantAccess(granteeAddress, recordHash, expiry, signer)
          contractCall = `grantAccess(${granteeAddress}, ${recordHash}, ${expiry})`
          break
          
        default:
          return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }

      if (transaction) {
        console.log(`🔗 Smart Contract Call: ${contractCall}`)
        console.log(`📝 Audit Event: ${user.email} ${action.toLowerCase()}ed record ${recordHash}`)
        console.log(`✅ Transaction Hash: ${transaction.hash}`)
        
        return NextResponse.json({ 
          success: true, 
          message: `${action} event recorded on blockchain`,
          contractAddress: CONTRACT_ADDRESS,
          contractCall: contractCall,
          transactionHash: transaction.hash,
          blockNumber: transaction.blockNumber || "Pending",
          blockchainVerified: true
        })
      }

      return NextResponse.json({ error: "Failed to record event" }, { status: 500 })

    } catch (contractError: any) {
      console.error("Smart contract error:", contractError)
      
      // Return error details for debugging
      return NextResponse.json({ 
        error: "Smart contract call failed",
        details: contractError.message,
        contractAddress: CONTRACT_ADDRESS,
        suggestion: "Make sure Hardhat node is running and contract is deployed"
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Smart contract audit error:", error)
    return NextResponse.json(
      { error: error?.message ?? "Failed to record audit event on blockchain" }, 
      { status: 500 }
    )
  }
}
