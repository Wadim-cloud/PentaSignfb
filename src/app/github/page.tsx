'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github, GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function GithubPage() {
  const { toast } = useToast();
  const [pushed, setPushed] = useState(false);

  const handlePush = () => {
    toast({
      title: 'Pushing to GitHub...',
      description: 'This is a simulation. Your code is not actually being pushed.',
    });
    setTimeout(() => {
      setPushed(true);
       toast({
        title: 'Successfully pushed to main branch!',
        description: 'Your changes are now on GitHub.',
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto max-w-2xl p-0">
      <Card>
        <CardHeader>
          <CardTitle>Push to GitHub</CardTitle>
          <CardDescription>
            Transfer your plugin code to a GitHub repository.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <GitBranch className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Current Branch: `main`
              </p>
              {pushed ? (
                 <p className="text-sm text-green-600 dark:text-green-500 flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Up to date.
                </p>
              ) : (
                 <p className="text-sm text-muted-foreground">
                  15 uncommitted changes.
                </p>
              )}
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Developer Preview</AlertTitle>
            <AlertDescription>
              This is a simulation. In a real application, this would connect to
              your GitHub account and push the code.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handlePush} disabled={pushed}>
            <Github className="mr-2 h-4 w-4" />
            {pushed ? 'Pushed Successfully' : 'Push to GitHub'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
