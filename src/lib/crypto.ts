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

/**
 * Generates a deterministic, visually interesting SVG pattern based on a hash string.
 * This replaces the original WASM-based SVG generation.
 */
function generateDynamicSvgFromHash(hash: string): string {
  const size = 220;
  const center = size / 2;
  const numPoints = 8;
  const radius = size * 0.4;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    points.push({
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    });
  }

  const colors = ["#C69572", "#F2F4F6", "#8A9BA8", "#5A6B7B"];
  let svgPaths = '';

  // Use parts of the hash to decide which points to connect
  for (let i = 0; i < hash.length - 2; i += 3) {
    const p1Index = parseInt(hash.substring(i, i + 1), 16) % numPoints;
    const p2Index = parseInt(hash.substring(i + 1, i + 2), 16) % numPoints;
    const colorIndex = parseInt(hash.substring(i + 2, i + 3), 16) % colors.length;

    if (p1Index !== p2Index) {
      const p1 = points[p1Index];
      const p2 = points[p2Index];
      svgPaths += `<path d="M${p1.x},${p1.y} L${p2.x},${p2.y}" stroke="${colors[colorIndex]}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${size}" height="${size}" fill="#050505"/>
${svgPaths}
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

    // 6. Generate a dynamic SVG pattern and a placeholder pattern object
    const maskNonce = Math.floor(Math.random() * 2**32);
    const pattern: Pattern = { nodes: [], edges: [] };
    const svg = generateDynamicSvgFromHash(docHash);

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
