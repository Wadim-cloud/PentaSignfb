import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, FileSignature, Upload } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const documentImage = PlaceHolderImages.find(p => p.id === 'document-1')!;
const signatureImage = PlaceHolderImages.find(p => p.id === 'signature-1')!;

export default function HomePage() {
  return (
    <div className="container mx-auto p-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>
                This is a preview of the document you are about to sign.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-4">
              <div className="relative w-full aspect-[8.5/11] max-w-2xl border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted/40">
                <Image
                  src={documentImage.imageUrl}
                  alt={documentImage.description}
                  data-ai-hint={documentImage.imageHint}
                  width={800}
                  height={1100}
                  className="object-contain p-4"
                  priority
                />
                <div className="absolute bottom-16 right-16">
                  <Image
                    src={signatureImage.imageUrl}
                    alt={signatureImage.description}
                    data-ai-hint={signatureImage.imageHint}
                    width={150}
                    height={75}
                    className="opacity-75"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Sign Document</CardTitle>
              <CardDescription>
                Apply your visual and cryptographic signature.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Visual Signature</p>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20">
                  <Image
                    src={signatureImage.imageUrl}
                    alt={signatureImage.description}
                    data-ai-hint={signatureImage.imageHint}
                    width={200}
                    height={100}
                  />
                  <Button variant="link" className="mt-2 text-accent">
                    Change Signature
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Cryptographic Key</p>
                <p className="text-xs text-muted-foreground bg-muted p-3 rounded-md font-mono break-all leading-relaxed">
                  -----BEGIN PGP PRIVATE KEY BLOCK-----
                  <br />
                  lQVYBFp3C+QBDAD...
                  <br />
                  ...Mwv/5E2g/0yX
                  <br />
                  -----END PGP PRIVATE KEY BLOCK-----
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 items-stretch">
              <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <FileSignature className="mr-2 h-5 w-5" />
                Sign & Store Document
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Load Document
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Signed
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
