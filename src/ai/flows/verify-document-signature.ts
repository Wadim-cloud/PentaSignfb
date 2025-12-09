'use server';

/**
 * @fileOverview Flow for verifying the visual and cryptographic signatures on a signed document within Penpot, using the Google Gemini API.
 *
 * - verifyDocumentSignature - A function that handles the document signature verification process.
 * - VerifyDocumentSignatureInput - The input type for the verifyDocumentSignature function.
 * - VerifyDocumentSignatureOutput - The return type for the verifyDocumentSignature function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyDocumentSignatureInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The signed document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  visualSignatureDataUri: z
    .string()
    .optional()
    .describe(
      'The visual signature applied to the document, as a data URI. Optional, but helps in verification.'
    ),
  cryptographicSignature: z.string().describe('The cryptographic signature of the document.'),
  documentMetadata: z
    .string()
    .optional()
    .describe('Additional metadata about the document that could help verify its integrity.'),
});

export type VerifyDocumentSignatureInput = z.infer<typeof VerifyDocumentSignatureInputSchema>;

const VerifyDocumentSignatureOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether the document is authentic and the signature is valid.'),
  verificationDetails: z.string().describe('Details of the verification process and any findings.'),
});

export type VerifyDocumentSignatureOutput = z.infer<typeof VerifyDocumentSignatureOutputSchema>;

export async function verifyDocumentSignature(input: VerifyDocumentSignatureInput): Promise<VerifyDocumentSignatureOutput> {
  return verifyDocumentSignatureFlow(input);
}

const verifyDocumentSignaturePrompt = ai.definePrompt({
  name: 'verifyDocumentSignaturePrompt',
  input: {schema: VerifyDocumentSignatureInputSchema},
  output: {schema: VerifyDocumentSignatureOutputSchema},
  prompt: `You are an expert in document security and cryptography. Your role is to verify the authenticity of a signed document.

  You will receive the document as a data URI, a visual signature (if available), a cryptographic signature, and additional document metadata (if available).

  Based on this information, you will determine whether the document is authentic and the signatures are valid. Explain your reasoning in detail.

  Consider the following factors:
  - The integrity of the document data.
  - The validity of the cryptographic signature.
  - The consistency of the visual signature with the document content.
  - Any anomalies or discrepancies in the document metadata.

  Document: {{media url=documentDataUri}}
  Visual Signature (if available): {{#if visualSignatureDataUri}}{{media url=visualSignatureDataUri}}{{else}}Not provided{{/if}}
  Cryptographic Signature: {{{cryptographicSignature}}}
  Metadata: {{{documentMetadata}}}

  Provide a clear and concise assessment of the document's authenticity, including a detailed explanation of your verification process and any findings.

  Output your assessment as JSON in the following format:
  {
    "isAuthentic": true/false,
    "verificationDetails": "Details of the verification process and any findings."
  }`,
});

const verifyDocumentSignatureFlow = ai.defineFlow(
  {
    name: 'verifyDocumentSignatureFlow',
    inputSchema: VerifyDocumentSignatureInputSchema,
    outputSchema: VerifyDocumentSignatureOutputSchema,
  },
  async input => {
    const {output} = await verifyDocumentSignaturePrompt(input);
    return output!;
  }
);
