'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { verifySignatureAction } from './actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, ShieldX, Upload } from 'lucide-react';
import type { VerifyDocumentSignatureOutput } from '@/ai/flows/verify-document-signature';

const formSchema = z.object({
  document: z.any().refine(files => files?.length > 0, 'Document is required.'),
  cryptographicSignature: z
    .string()
    .min(1, 'Cryptographic signature is required.'),
});

export default function VerifySignaturePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyDocumentSignatureOutput | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cryptographicSignature: '',
    },
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
      const documentFile = values.document[0];
      const documentDataUri = await fileToBase64(documentFile);

      const response = await verifySignatureAction({
        documentDataUri,
        cryptographicSignature: values.cryptographicSignature,
      });

      setResult(response);
    } catch (error) {
      console.error(error);
      setResult({
        isAuthentic: false,
        verificationDetails:
          'Failed to process the request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-0">
      <Card>
        <CardHeader>
          <CardTitle>Verify Document Signature</CardTitle>
          <CardDescription>
            Upload a document and its cryptographic signature to verify its
            authenticity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="document"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Document File</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          {...rest}
                          onChange={event => {
                            onChange(event.target.files);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cryptographicSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cryptographic Signature</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the cryptographic signature here..."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Verify Signature
              </Button>
            </form>
          </Form>

          {result && (
            <Alert
              variant={result.isAuthentic ? 'default' : 'destructive'}
              className="mt-8"
            >
              {result.isAuthentic ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldX className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.isAuthentic
                  ? 'Verification Successful'
                  : 'Verification Failed'}
              </AlertTitle>
              <AlertDescription>{result.verificationDetails}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
