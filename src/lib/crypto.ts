'use client';

import init from './pentasign_crypto_wasm/pentasign_crypto_wasm';

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export interface SignatureBundle {
  docHash: string;
  sofi: string;
  publicKey: string;
  signature: string;
  maskNonce: number;
}

export interface Pattern {
  nodes: { x: number; y: number }[];
  edges: { start: number; end: number; color: number }[];
}

function bytesToHex(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}

export class WasmClient {
  private static instance: WasmClient | null = null;
  private static wasm: any | null = null;
  private constructor() {}

  public static async create(): Promise<WasmClient> {
    if (WasmClient.instance) {
      return WasmClient.instance;
    }
    
    WasmClient.wasm = await init();
    WasmClient.instance = new WasmClient();
    return WasmClient.instance;
  }

  private async getDocHash(pdfBytes: Uint8Array): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBytes);
    return bytesToHex(new Uint8Array(hashBuffer));
  }

  private constructMessage(docHash: string, sofi: string): Uint8Array {
    const textEncoder = new TextEncoder();
    const docHashBytes = textEncoder.encode(docHash);
    const sofiBytes = textEncoder.encode(sofi);
    const message = new Uint8Array(docHashBytes.length + sofiBytes.length);
    message.set(docHashBytes);
    message.set(sofiBytes, docHashBytes.length);
    return message;
  }

  private async getMessageHash(message: Uint8Array): Promise<Uint8Array> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', message);
    return new Uint8Array(hashBuffer);
  }

  public async signPdf(
    pdfBytes: Uint8Array,
    sofi: string
  ): Promise<{ bundle: SignatureBundle; pattern: Pattern; svg: string }> {
    if (!WasmClient.wasm) {
        throw new Error("WASM module not initialized");
    }

    const {
        generate_keypair,
        public_from_private,
        sign_payload,
        build_pattern
    } = WasmClient.wasm;
    
    // 1. Hash the document
    const docHash = await this.getDocHash(pdfBytes);

    // 2. Construct and hash the signing message
    const message = this.constructMessage(docHash, sofi);
    const messageHash = await this.getMessageHash(message);

    // 3. Generate an ephemeral keypair
    const keypair = generate_keypair();
    const privateKey = keypair.private_key;
    const publicKey = public_from_private(privateKey);
    
    // 4. Sign the message hash
    const signature = sign_payload(messageHash, privateKey);
    
    // 5. Generate pattern
    const idSeed = parseInt(sofi.slice(0, 8), 10); // Simple seed from sofi
    const maskNonce = Math.floor(Math.random() * 2**32);
    
    const { pattern, svg } = build_pattern(idSeed, [], maskNonce);

    // 6. Create the bundle
    const bundle: SignatureBundle = {
      docHash: docHash,
      sofi: sofi,
      publicKey: bytesToBase64(publicKey),
      signature: bytesToBase64(signature),
      maskNonce: maskNonce,
    };
    
    return { bundle, pattern, svg };
  }
}
