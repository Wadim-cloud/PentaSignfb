'use client';

import { useState } from 'react';
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

export default function ManifestGeneratorPage() {
  const [manifestJson, setManifestJson] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof manifestSchema>>({
    resolver: zodResolver(manifestSchema),
    defaultValues: {
      name: 'PentaSign Plugin',
      id: 'pentasign-plugin',
      api: '1.0.0',
      main: 'dist/code.js',
      ui: 'dist/ui.html',
    },
  });

  function onSubmit(values: z.infer<typeof manifestSchema>) {
    const manifest = {
      name: values.name,
      id: values.id,
      api: values.api,
      main: values.main,
      ui: values.ui,
      editorType: ['penpot'],
    };
    const jsonString = JSON.stringify(manifest, null, 2);
    setManifestJson(jsonString);
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
          <CardTitle>Manifest Generator</CardTitle>
          <CardDescription>
            Fill in the details to generate your plugin&apos;s manifest.json.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plugin Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plugin ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="api"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Version</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="main"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main file (code.js path)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ui"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UI file (ui.html path)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <FileJson className="mr-2 h-4 w-4" />
                Generate Manifest
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Generated manifest.json</h3>
        <div className="relative">
          <Textarea
            readOnly
            value={manifestJson}
            className="min-h-[300px] font-mono text-sm bg-muted/50"
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
      </div>
    </div>
  );
}
