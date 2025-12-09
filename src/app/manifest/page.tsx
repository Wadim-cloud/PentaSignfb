'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { FileJson, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const manifestSchema = z.object({
  name: z.string().min(1, 'Plugin name is required'),
  id: z.string().min(1, 'Plugin ID is required'),
  api: z.string().min(1, 'API version is required'),
  main: z.string().min(1, 'Main file is required'),
  ui: z.string().min(1, 'UI file is required'),
});

const defaultManifest = {
  name: 'PentaSign Plugin',
  id: 'pentasign-plugin',
  api: '1.0.0',
  main: 'code.js',
  ui: 'ui.html',
  editorType: ['penpot'],
};

export default function ManifestGeneratorPage() {
  const [manifestJson, setManifestJson] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof manifestSchema>>({
    resolver: zodResolver(manifestSchema),
    defaultValues: {
      name: defaultManifest.name,
      id: defaultManifest.id,
      api: defaultManifest.api,
      main: defaultManifest.main,
      ui: defaultManifest.ui,
    },
  });

  function generateManifest(values: z.infer<typeof manifestSchema>) {
    const manifest = {
      name: values.name,
      id: values.id,
      api: values.api,
      main: values.main,
      ui: values.ui,
      editorType: defaultManifest.editorType,
    };
    const jsonString = JSON.stringify(manifest, null, 2);
    setManifestJson(jsonString);
  }

  useEffect(() => {
    generateManifest(form.getValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  function onSubmit(values: z.infer<typeof manifestSchema>) {
    generateManifest(values);
    toast({
      title: 'Manifest Generated',
      description: 'You can now copy the JSON content.',
    });
  }

  const copyToClipboard = () => {
    if (!manifestJson) return;
    navigator.clipboard.writeText(manifestJson);
    toast({
      title: 'Copied to clipboard!',
      description: 'The manifest.json content has been copied.',
    });
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-0">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Manifest</CardTitle>
          <CardDescription>
            This is the `manifest.json` for your Penpot plugin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="relative">
              <Textarea
                readOnly
                value={manifestJson}
                className="min-h-[360px] font-mono text-sm bg-muted/50"
                placeholder="Generated JSON will appear here..."
              />
              {manifestJson && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-background"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Alert>
                <FileJson className="h-4 w-4" />
                <AlertTitle>How to use this plugin</AlertTitle>
                <AlertDescription>
                    To install this plugin in Penpot, go to the plugins section and choose &quot;Import plugin&quot;. You can import directly from this URL: 
                    <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-x-auto">{`${typeof window !== 'undefined' ? window.location.origin : ''}/penpot-plugin/manifest.json`}</pre>
                </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Plugin UI Preview</CardTitle>
          <CardDescription>
            This is a preview of the plugin&apos;s UI that will run inside Penpot.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <iframe src="/penpot-plugin/ui.html" className="w-full h-[480px] border rounded-md bg-white"/>
        </CardContent>
      </Card>
    </div>
  );
}
