'use server';

import {
  verifyDocumentSignature,
  VerifyDocumentSignatureInput,
  VerifyDocumentSignatureOutput,
} from '@/ai/flows/verify-document-signature';

export async function verifySignatureAction(
  input: VerifyDocumentSignatureInput
): Promise<VerifyDocumentSignatureOutput> {
  // In a real app, you'd add authentication and authorization checks here.
  try {
    const result = await verifyDocumentSignature(input);
    return result;
  } catch (error) {
    console.error('Signature verification failed:', error);
    // Returning a structured error is better for the client
    return {
      isAuthentic: false,
      verificationDetails:
        'An unexpected error occurred during verification. Please check the server logs.',
    };
  }
}
