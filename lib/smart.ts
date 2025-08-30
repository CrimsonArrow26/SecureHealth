// PKCE + SMART helpers (browser-safe)
export type SmartConfig = {
  authorization_endpoint: string
  token_endpoint: string
  issuer?: string
  scopes_supported?: string[]
  grant_types_supported?: string[]
}

function toUint8(str: string) {
  return new TextEncoder().encode(str)
}

function base64url(bytes: Uint8Array) {
  const str = btoa(String.fromCharCode(...bytes))
  return str.replace(/\+/g, "-").replace(/\//g, "-").replace(/=+$/, "")
}

export async function sha256(data: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", data)
  return new Uint8Array(digest)
}

function randomBytes(n = 32) {
  const u = new Uint8Array(n)
  crypto.getRandomValues(u)
  return u
}

export async function generatePkcePair() {
  const verifierBytes = randomBytes(32)
  const verifier = base64url(verifierBytes)
  const challenge = base64url(await sha256(toUint8(verifier)))
  return { verifier, challenge }
}

export function buildAuthUrl(params: {
  authorizationEndpoint: string
  clientId: string
  redirectUri: string
  scope: string
  state: string
  codeChallenge: string
  aud?: string
}) {
  const u = new URL(params.authorizationEndpoint)
  const q = u.searchParams
  q.set("response_type", "code")
  q.set("client_id", params.clientId)
  q.set("redirect_uri", params.redirectUri)
  q.set("scope", params.scope)
  q.set("state", params.state)
  q.set("code_challenge", params.codeChallenge)
  q.set("code_challenge_method", "S256")
  if (params.aud) q.set("aud", params.aud)
  return u.toString()
}
