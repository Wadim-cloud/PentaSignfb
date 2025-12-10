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
import { Github, GitBranch, CheckCircle2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const repoUrl = 'https://github.com/new';

export default function GithubPage() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const commands = [
    {
      description: 'Initialize a new Git repository',
      command: 'git init -b main',
    },
    {
      description: 'Add all files to the staging area',
      command: 'git add .',
    },
    {
      description: 'Commit your changes',
      command: 'git commit -m "Initial commit"',
    },
    {
      description:
        'Add your new GitHub repository as the remote origin',
      command:
        'git remote add origin https://github.com/Wadim-cloud/PentaSignfb.git',
    },
    {
      description: 'Push your code to the main branch on GitHub',
      command: 'git push -u origin main',
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl p-0">
      <Card>
        <CardHeader>
          <CardTitle>Deploy to GitHub Pages</CardTitle>
          <CardDescription>
            Follow these steps to deploy your plugin to a live URL using GitHub
            Actions and GitHub Pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <GitBranch className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="font-medium leading-none">
                Continuous Integration & Deployment
              </p>
              <div className="text-sm text-green-600 dark:text-green-500 flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Workflow file created at{' '}
                <Badge variant="secondary" className="ml-2">
                  .github/workflows/deploy.yml
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Step 1: Create a GitHub Repository
            </h3>
            <div className="text-sm text-muted-foreground mb-4">
              If you haven't already, create a new repository on GitHub. You've provided the URL, so you're ready for the next step!
            </div>
            <Button asChild>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Create another repository
              </a>
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Step 2: Push Your Code
            </h3>
            <div className="text-sm text-muted-foreground mb-4">
              Open a terminal in your project's root directory and run the
              following commands. I've already included your repository URL.
            </div>
            <div className="space-y-2">
              {commands.map((item, index) => (
                <Alert key={index} className="font-mono text-sm">
                  <AlertDescription className="flex justify-between items-center">
                    <span className="break-all">
                      <span className="text-muted-foreground mr-2">$</span>
                      {item.command}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(item.command)}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
           <div>
            <h3 className="text-lg font-semibold mb-2">
              Step 3: Enable GitHub Pages
            </h3>
            <div className="text-sm text-muted-foreground">
              Once you've pushed your code, go to your repository's settings on GitHub. Navigate to the "Pages" section and select the source as "GitHub Actions". Your site will be deployed automatically on the next push.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
