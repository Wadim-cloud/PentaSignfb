
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileSignature, Upload } from 'lucide-react';
import { sha256, generateKeypair, signPayload, toBase64 } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sofi, setSofi] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [signatureBundle, setSignatureBundle] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSign = async () => {
    if (!file || !sofi) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please select a document and provide a Sofi ID.',
      });
      return;
    }

    setIsLoading(true);
    setSignatureBundle(null);

    try {
      const fileBuffer = await file.arrayBuffer();
      const docHash = await sha256(fileBuffer);

      const messageEncoder = new TextEncoder();
      const docHashHex = Array.from(docHash)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const message = messageEncoder.encode(docHashHex + sofi);
      
      const messageHash = await sha256(message);

      const keypair = await generateKeypair();
      const signature = await signPayload(messageHash, keypair.privateKey);

      const bundle = {
        publicKey: toBase64(keypair.publicKey),
        signature: toBase64(signature),
        docHash: docHashHex,
        sofi: sofi,
      };

      setSignatureBundle(JSON.stringify(bundle, null, 2));
      toast({
        title: 'Document Signed Successfully',
        description: 'The signature bundle has been generated.',
      });
    } catch (error) {
      console.error('Signing error:', error);
      toast({
        variant: 'destructive',
        title: 'Signing Failed',
        description:
          'An error occurred while signing the document. See console for details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!signatureBundle) return;
    navigator.clipboard.writeText(signatureBundle);
    toast({
      title: 'Copied to clipboard!',
    });
  };


  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-0">
      <Card>
        <CardHeader>
          <CardTitle>Create Ephemeral Signature</CardTitle>
          <CardDescription>
            Generate a unique, identity-linked signature for your document.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document">1. Select Document (PDF)</Label>
            <Input id="document" type="file" onChange={handleFileChange} accept=".pdf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sofi">2. Provide Identity String (Sofi)</Label>
            <Input
              id="sofi"
              placeholder="e.g., user@example.com"
              value={sofi}
              onChange={e => setSofi(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSign} disabled={isLoading || !file || !sofi} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSignature className="mr-2 h-4 w-4" />
            )}
            Sign Document
          </Button>
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Generated Signature Bundle</h3>
        <div className="relative">
          <Textarea
            readOnly
            value={signatureBundle ?? ''}
            className="min-h-[300px] font-mono text-sm bg-muted/50"
            placeholder="Signature bundle will appear here..."
          />
          {signatureBundle && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-background"
              onClick={copyToClipboard}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </Button>
          )}
        </div>
        {signatureBundle && (
           <Alert>
             <AlertTitle>Private Key Not Stored</AlertTitle>
             <AlertDescription>
               The private key was generated for this session only and has been discarded.
               This signature bundle contains the public key for verification.
             </AlertDescription>
           </Alert>
        )}
      </div>
    </div>
  );
}

