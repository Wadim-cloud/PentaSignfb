'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Fingerprint, Copy, Upload } from 'lucide-react';
import type { SignatureBundle, WasmClient } from '@/lib/crypto';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  document: z.any().refine(files => files?.length > 0, 'Document is required.'),
  sofi: z
    .string()
    .min(1, 'SOFI/ID is required.')
    .regex(/^\d+$/, 'SOFI/ID must be a number.'),
});

type SignFormValues = z.infer<typeof formSchema>;

export default function CreateSignaturePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [bundle, setBundle] = useState<SignatureBundle | null>(null);
  const [bundleJson, setBundleJson] = useState('');
  const [svgPattern, setSvgPattern] = useState('');
  const [isWasmReady, setIsWasmReady] = useState(false);
  const wasmClientRef = useRef<WasmClient | null>(null);

  const form = useForm<SignFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sofi: '111111111',
    },
  });

  useEffect(() => {
    async function initWasm() {
      try {
        const { WasmClient } = await import('@/lib/crypto');
        wasmClientRef.current = await WasmClient.create();
        setIsWasmReady(true);
      } catch (error) {
        console.error('Failed to load WASM module', error);
        setStatus({
          message: 'Failed to load cryptographic module. Please refresh.',
          type: 'error',
        });
      }
    }
    initWasm();
  }, []);

  const fileToBytes = (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = error => reject(error);
    });
  };

  async function onSubmit(values: SignFormValues) {
    if (!wasmClientRef.current) {
      setStatus({
        message: 'Cryptographic module not ready.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    setStatus({ message: 'Processing document...', type: 'info' });
    setBundle(null);
    setBundleJson('');
    setSvgPattern('');

    try {
      const documentFile = values.document[0];
      const pdfBytes = await fileToBytes(documentFile);

      setStatus({
        message: 'Generating keypair and signature...',
        type: 'info',
      });

      const { bundle: signedBundle, svg } = await wasmClientRef.current.signPdf(pdfBytes, values.sofi);

      setBundle(signedBundle);
      setBundleJson(JSON.stringify(signedBundle, null, 2));
      setSvgPattern(svg);
      setStatus({
        message: 'Document signed successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      setStatus({
        message: `Signing failed: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setStatus({
      message: `${type} copied to clipboard!`,
      type: 'success',
    });
  };

  const isReady = isWasmReady && !isLoading;

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-0">
      <Card>
        <CardHeader>
          <CardTitle>Create Ephemeral Signature</CardTitle>
          <CardDescription>
            Upload a document and provide your SOFI/ID to generate a unique
            cryptographic and visual signature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isWasmReady ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <div className="text-center text-sm text-muted-foreground pt-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Loading cryptographic module...
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Document (PDF)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          {...rest}
                          onChange={event => {
                            onChange(event.target.files);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sofi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SOFI / ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 111111111" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={!isReady} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Fingerprint className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Signing...' : 'Generate Signature'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Signature Output</CardTitle>
            <CardDescription>
              The generated signature bundle and visual pattern.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="bundleOutput">Signature Bundle (JSON)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bundleJson, 'Bundle JSON')}
                  disabled={!bundleJson}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
              <Textarea
                id="bundleOutput"
                readOnly
                value={bundleJson}
                className="min-h-[150px] font-mono text-sm bg-muted/50"
                placeholder="Signature bundle will appear here..."
              />
            </div>
             <div>
              <Label>Visual Signature Pattern (SVG)</Label>
              <div className="mt-2 w-full aspect-square rounded-lg border-2 border-dashed bg-muted/50 flex items-center justify-center overflow-hidden">
                {isLoading && !svgPattern && (
                  <div className="text-center text-sm text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="mt-2">Generating pattern...</p>
                  </div>
                )}
                {!isLoading && !svgPattern && (
                   <p className="text-muted-foreground text-sm">SVG pattern will appear here</p>
                )}
                {svgPattern && (
                  <div
                    className="p-4"
                    dangerouslySetInnerHTML={{ __html: svgPattern }}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {status && (
          <Alert
            variant={
              status.type === 'error'
                ? 'destructive'
                : status.type === 'success'
                ? 'default'
                : 'default'
            }
            className={status.type === 'success' ? 'border-green-500/50 text-green-700 [&>svg]:text-green-700 dark:border-green-500/50 dark:text-green-400 dark:[&>svg]:text-green-400' : ''}
          >
            <AlertTitle className="capitalize">{status.type}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Aler>
        )}
      </div>
    </div>
  );
}
