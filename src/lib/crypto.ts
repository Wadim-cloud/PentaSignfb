
'use client';

import init, {
  generate_keypair as wasm_generate_keypair,
  public_from_private as wasm_public_from_private,
  sign_payload as wasm_sign_payload,
} from '@/lib/pentasign_crypto_wasm';

let wasmInitialized = false;

async function initializeWasm() {
  if (!wasmInitialized) {
    await init();
    wasmInitialized = true;
  }
}

export async function generateKeypair(): Promise<{
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}> {
  await initializeWasm();
  const keypair = wasm_generate_keypair();
  return {
    publicKey: keypair.public_key,
    privateKey: keypair.private_key,
  };
}

export async function signPayload(
  payloadHash: Uint8Array,
  privateKey: Uint8Array
): Promise<Uint8Array> {
  await initializeWasm();
  return wasm_sign_payload(payload_hash, privateKey);
}

export async function getPublicKey(
  privateKey: Uint8Array
): Promise<Uint8Array> {
  await initializeWasm();
  return wasm_public_from_private(privateKey);
}

export async function sha256(buffer: ArrayBuffer): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(hashBuffer);
}

export function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}
