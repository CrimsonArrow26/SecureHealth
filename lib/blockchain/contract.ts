import { ethers } from 'ethers'

// Your deployed contract address
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// Contract ABI - this should match your deployed contract
export const CONTRACT_ABI = [
  "event RecordCommitted(address indexed owner, bytes32 indexed recordHash, uint256 indexed committedAt)",
  "event AccessGranted(address indexed owner, address indexed grantee, bytes32 indexed recordHash, uint64 expiry)",
  "event AccessRevoked(address indexed owner, address indexed grantee, bytes32 indexed recordHash)",
  "event RecordViewed(address indexed viewer, address indexed owner, bytes32 indexed recordHash, uint256 timestamp, string viewerType)",
  "event RecordDownloaded(address indexed downloader, address indexed owner, bytes32 indexed recordHash, uint256 timestamp, string downloaderType)",
  "event PermissionChanged(address indexed owner, address indexed grantee, bytes32 indexed recordHash, string action, uint256 timestamp)",
  "event AuditLogCreated(bytes32 indexed auditId, address indexed actor, string action, bytes32 indexed recordHash, uint256 timestamp)",
  
  "function commitRecord(bytes32 recordHash) external",
  "function grantAccess(address grantee, bytes32 recordHash, uint64 expiry) external",
  "function revokeAccess(address grantee, bytes32 recordHash) external",
  "function recordView(address owner, bytes32 recordHash, string memory viewerType) external",
  "function recordDownload(address owner, bytes32 recordHash, string memory downloaderType) external",
  "function hasRecord(address owner, bytes32 recordHash) external view returns (bool)",
  "function accessInfo(address owner, address grantee, bytes32 recordHash) external view returns (bool hasAccess, uint64 expiry)",
  "function getAuditTrail(bytes32 recordHash) external view returns (tuple(bytes32 auditId, address actor, string action, bytes32 recordHash, uint256 timestamp, string metadata)[] memory)"
]

// Provider for local Hardhat network
export const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

// Contract instance
export const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

// Function to get audit trail from smart contract
export async function getAuditTrail(recordHash?: string) {
  try {
    if (recordHash) {
      const auditTrail = await contract.getAuditTrail(recordHash)
      return auditTrail
    }
    return []
  } catch (error) {
    console.error("Failed to get audit trail from contract:", error)
    return []
  }
}

// Function to record a view event
export async function recordView(ownerAddress: string, recordHash: string, viewerType: string, signer: ethers.Signer) {
  try {
    const contractWithSigner = contract.connect(signer)
    const tx = await (contractWithSigner as any).recordView(ownerAddress, recordHash, viewerType)
    await tx.wait()
    return tx
  } catch (error) {
    console.error("Failed to record view event:", error)
    throw error
  }
}

// Function to record a download event
export async function recordDownload(ownerAddress: string, recordHash: string, downloaderType: string, signer: ethers.Signer) {
  try {
    const contractWithSigner = contract.connect(signer)
    const tx = await (contractWithSigner as any).recordDownload(ownerAddress, recordHash, downloaderType)
    await tx.wait()
    return tx
  } catch (error) {
    console.error("Failed to record download event:", error)
    throw error
  }
}

// Function to grant access
export async function grantAccess(granteeAddress: string, recordHash: string, expiry: number, signer: ethers.Signer) {
  try {
    const contractWithSigner = contract.connect(signer)
    const tx = await (contractWithSigner as any).grantAccess(granteeAddress, recordHash, expiry)
    await tx.wait()
    return tx
  } catch (error) {
    console.error("Failed to grant access:", error)
    throw error
  }
}

// Function to check if user has access
export async function hasAccess(ownerAddress: string, granteeAddress: string, recordHash: string) {
  try {
    const [hasAccess, expiry] = await contract.accessInfo(ownerAddress, granteeAddress, recordHash)
    return { hasAccess, expiry: Number(expiry) }
  } catch (error) {
    console.error("Failed to check access:", error)
    return { hasAccess: false, expiry: 0 }
  }
}
