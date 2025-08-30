// Uses Web Crypto API (browser) for RSA-OAEP key pair and PBKDF2-protected private key storage.

export type KeyPair = {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

const subtle = globalThis?.crypto?.subtle

function enc(text: string) {
  return new TextEncoder().encode(text)
}
function dec(buf: ArrayBuffer) {
  return new TextDecoder().decode(buf)
}

export async function generateRsaOaep(): Promise<KeyPair> {
  if (!subtle) throw new Error("Web Crypto not available")
  // 2048 for reasonable performance in-browser demos; upgradeable to 3072/4096
  const keyPair = await subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  )
  return keyPair as KeyPair
}

export async function exportPublicKeyJwk(key: CryptoKey) {
  return (await subtle!.exportKey("jwk", key)) as JsonWebKey
}

export async function exportPrivateKeyJwk(key: CryptoKey) {
  return (await subtle!.exportKey("jwk", key)) as JsonWebKey
}

export async function importPublicKeyJwk(jwk: JsonWebKey) {
  return subtle!.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"])
}

export async function importPrivateKeyJwk(jwk: JsonWebKey) {
  return subtle!.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"])
}

// Derive a key from passphrase using PBKDF2
async function deriveAesKey(passphrase: string, salt: Uint8Array) {
  const baseKey = await subtle!.importKey("raw", enc(passphrase), "PBKDF2", false, ["deriveKey"])
  return subtle!.deriveKey(
    { name: "PBKDF2", salt, iterations: 160_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export type WrappedPrivateKey = {
  kty: "RSA-OAEP-JWE-v1"
  saltB64: string
  ivB64: string
  ciphertextB64: string
  pubJwk: JsonWebKey
  fingerprint: string
  createdAt: string
}

function toB64(u8: Uint8Array) {
  return btoa(String.fromCharCode(...u8))
}
function fromB64(b64: string) {
  const bin = atob(b64)
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)))
}

export async function wrapPrivateKeyWithPassphrase(
  privateJwk: JsonWebKey,
  publicJwk: JsonWebKey,
  passphrase: string,
): Promise<WrappedPrivateKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const aesKey = await deriveAesKey(passphrase, salt)
  const payload = enc(JSON.stringify(privateJwk))
  const ciphertext = new Uint8Array(await subtle!.encrypt({ name: "AES-GCM", iv }, aesKey, payload))

  const fingerprint = await publicKeyFingerprint(publicJwk)
  return {
    kty: "RSA-OAEP-JWE-v1",
    saltB64: toB64(salt),
    ivB64: toB64(iv),
    ciphertextB64: toB64(ciphertext),
    pubJwk: publicJwk,
    fingerprint,
    createdAt: new Date().toISOString(),
  }
}

export async function unwrapPrivateKeyWithPassphrase(
  wrapped: WrappedPrivateKey,
  passphrase: string,
): Promise<JsonWebKey> {
  const salt = fromB64(wrapped.saltB64)
  const iv = fromB64(wrapped.ivB64)
  const ct = fromB64(wrapped.ciphertextB64)
  const aesKey = await deriveAesKey(passphrase, salt)
  const plaintext = await subtle!.decrypt({ name: "AES-GCM", iv }, aesKey, ct)
  const json = dec(plaintext)
  return JSON.parse(json)
}

export async function publicKeyFingerprint(pubJwk: JsonWebKey): Promise<string> {
  // Simple SHA-256 of the JWK JSON for display; not a formal DID
  const data = enc(JSON.stringify(pubJwk))
  const hash = new Uint8Array(await subtle!.digest("SHA-256", data))
  // take first 8 bytes as hex
  return [...hash.slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Hybrid content encryption demo helpers (record-level):
export async function generateContentKey(): Promise<CryptoKey> {
  return subtle!.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
}

export async function encryptContent(key: CryptoKey, data: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await subtle!.encrypt({ name: "AES-GCM", iv }, key, data)
  return { iv, ciphertext: new Uint8Array(ciphertext) }
}

export async function decryptContent(key: CryptoKey, iv: Uint8Array, ciphertext: Uint8Array) {
  const plaintext = await subtle!.decrypt({ name: "AES-GCM", iv }, key, ciphertext)
  return new Uint8Array(plaintext)
}

export async function sha256Hex(data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function toBase64(u8: Uint8Array): string {
  return toB64(u8)
}

/**
 * Encrypt arbitrary data using a user passphrase with PBKDF2 (SHA-256, 160k iters) and AES-GCM(256).
 * Returns both raw values (Uint8Array) and Base64-encoded strings for convenient transport/storage.
 */
export async function encryptWithPassphrase(
  passphrase: string,
  data: Uint8Array,
): Promise<{
  salt: Uint8Array
  iv: Uint8Array
  ciphertext: Uint8Array
  saltB64: string
  ivB64: string
  ciphertextB64: string
}> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const aesKey = await (async () => {
    // reuse internal PBKDF2 derivation
    // deriveAesKey is defined above in this module
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return deriveAesKey(passphrase, salt)
  })()
  const ciphertext = new Uint8Array(await subtle!.encrypt({ name: "AES-GCM", iv }, aesKey, data))
  return {
    salt,
    iv,
    ciphertext,
    saltB64: toB64(salt),
    ivB64: toB64(iv),
    ciphertextB64: toB64(ciphertext),
  }
}
