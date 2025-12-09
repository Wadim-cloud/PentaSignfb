'use client';

// This file is re-implemented using the standard browser SubtleCrypto API
// to avoid the persistent WebAssembly compilation errors.

export interface KeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

export interface SignatureBundle {
  docHash: string;
  sofi: string;
  publicKey: string; // Base64 encoded
  signature: string; // Base64 encoded
  maskNonce: number;
}

// A placeholder for the pattern generation, since the WASM module for this is also removed.
export interface Pattern {
    nodes: { x: number; y: number }[];
    edges: { start: number; end: number; color: number }[];
}


function bytesToHex(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// A placeholder SVG since the original generation logic was in the removed WASM.
function placeholderSvg() {
    const size = 220;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${size}" height="${size}" fill="#050505"/>
<circle cx="110" cy="110" r="50" stroke="#C69572" stroke-width="2"/>
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#F2F4F6" font-size="14">Signature Pattern</text>
</svg>`;
}


export class WasmClient {
  private static instance: WasmClient | null = null;

  private constructor() {}

  // This is no longer async as there's no WASM to load.
  public static create(): WasmClient {
    if (!WasmClient.instance) {
      WasmClient.instance = new WasmClient();
    }
    return WasmClient.instance;
  }

  private async getDocHash(pdfBytes: Uint8Array): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBytes);
    return bytesToHex(new Uint8Array(hashBuffer));
  }

  private constructMessage(docHash: string, sofi: string): Uint8Array {
    const textEncoder = new TextEncoder();
    return textEncoder.encode(`${docHash}${sofi}`);
  }
  
  public async signPdf(
    pdfBytes: Uint8Array,
    sofi: string
  ): Promise<{ bundle: SignatureBundle; pattern: Pattern; svg: string }> {
    
    // 1. Hash the document
    const docHash = await this.getDocHash(pdfBytes);

    // 2. Construct the signing message
    const message = this.constructMessage(docHash, sofi);

    // 3. Generate an ephemeral keypair using SubtleCrypto
    const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        true, // exportable
        ["sign", "verify"]
      );

    // 4. Sign the message
    const signatureBuffer = await crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" },
        },
        keyPair.privateKey,
        message
      );
    
    // 5. Export public key to be stored
    const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);

    // 6. Generate a placeholder pattern and nonce
    const maskNonce = Math.floor(Math.random() * 2**32);
    const pattern: Pattern = { nodes: [], edges: [] };
    const svg = placeholderSvg();

    // 7. Create the bundle
    const bundle: SignatureBundle = {
      docHash: docHash,
      sofi: sofi,
      publicKey: bufferToBase64(publicKeyBuffer),
      signature: bufferToBase64(signatureBuffer),
      maskNonce: maskNonce,
    };
    
    return { bundle, pattern, svg };
  }
}
