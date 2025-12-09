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
    const numShapes = 12;
    const maxRadius = size * 0.45;

    const colors = ["#C69572", "#8A9BA8", "#F2F4F6", "#5A6B7B"];
    let svgElements = '';

    // Generate concentric rings and dots
    for (let i = 0; i < numShapes; i++) {
        const hashSegment = hash.substring(i * 4, (i + 1) * 4);
        if (hashSegment.length < 4) continue;

        const p1 = parseInt(hashSegment.substring(0, 2), 16) / 255;
        const p2 = parseInt(hashSegment.substring(2, 4), 16) / 255;

        const angle = p1 * 2 * Math.PI;
        const radius = (0.2 + p2 * 0.8) * maxRadius; // Start from 20% of max radius
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);

        const colorIndex = (i % colors.length);

        // Alternate between rings and dots
        if (i % 3 === 0) { // Ring
            const ringRadius = 5 + (p1 * 10);
            svgElements += `<circle cx="${x}" cy="${y}" r="${ringRadius}" stroke="${colors[colorIndex]}" stroke-width="1.5" fill="none" />`;
            svgElements += `<circle cx="${x}" cy="${y}" r="${ringRadius * 0.5}" fill="white" />`; // Inner dot
        } else { // Dot
            const dotRadius = 1 + (p2 * 3);
            const color = i % 5 === 0 ? "white" : colors[colorIndex];
            svgElements += `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="${color}" />`;
        }
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${size}" height="${size}" fill="hsl(var(--background))"/>
${svgElements}
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
