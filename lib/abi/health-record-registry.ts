export const healthRecordRegistryAbi = [
  {
    type: "function",
    name: "commitRecord",
    stateMutability: "nonpayable",
    inputs: [{ name: "recordHash", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "grantAccess",
    stateMutability: "nonpayable",
    inputs: [
      { name: "grantee", type: "address" },
      { name: "recordHash", type: "bytes32" },
      { name: "expiry", type: "uint64" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revokeAccess",
    stateMutability: "nonpayable",
    inputs: [
      { name: "grantee", type: "address" },
      { name: "recordHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "hasRecord",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "recordHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "accessInfo",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "grantee", type: "address" },
      { name: "recordHash", type: "bytes32" },
    ],
    outputs: [
      { name: "hasAccess", type: "bool" },
      { name: "expiry", type: "uint64" },
    ],
  },
] as const
