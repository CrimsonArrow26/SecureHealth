"use client"

import {
  exportPrivateKeyJwk,
  exportPublicKeyJwk,
  generateRsaOaep,
  importPrivateKeyJwk,
  importPublicKeyJwk,
  publicKeyFingerprint,
  unwrapPrivateKeyWithPassphrase,
  wrapPrivateKeyWithPassphrase,
  type WrappedPrivateKey,
} from "./crypto"

const STORAGE_KEY = "keyring.v1"

export type KeyringState = {
  exists: boolean
  fingerprint?: string
  pubJwk?: JsonWebKey
}

export async function setupKeyring(passphrase: string): Promise<KeyringState> {
  const { publicKey, privateKey } = await generateRsaOaep()
  const pubJwk = await exportPublicKeyJwk(publicKey)
  const privJwk = await exportPrivateKeyJwk(privateKey)
  const wrapped = await wrapPrivateKeyWithPassphrase(privJwk, pubJwk, passphrase)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapped))
  return { exists: true, fingerprint: wrapped.fingerprint, pubJwk }
}

export function hasKeyring(): boolean {
  return !!localStorage.getItem(STORAGE_KEY)
}

export function getWrapped(): WrappedPrivateKey | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as WrappedPrivateKey
  } catch {
    return null
  }
}

export async function loadPublicKey(): Promise<{ fingerprint: string; pubKey: CryptoKey; pubJwk: JsonWebKey } | null> {
  const wrapped = getWrapped()
  if (!wrapped) return null
  const pubKey = await importPublicKeyJwk(wrapped.pubJwk)
  const fp = wrapped.fingerprint || (await publicKeyFingerprint(wrapped.pubJwk))
  return { fingerprint: fp, pubKey, pubJwk: wrapped.pubJwk }
}

export async function unlockPrivateKey(passphrase: string): Promise<CryptoKey> {
  const wrapped = getWrapped()
  if (!wrapped) throw new Error("No keyring found")
  const privJwk = await unwrapPrivateKeyWithPassphrase(wrapped, passphrase)
  return importPrivateKeyJwk(privJwk)
}

export function destroyKeyring() {
  localStorage.removeItem(STORAGE_KEY)
}
