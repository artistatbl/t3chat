'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ApiKeysForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Manage your API keys for different services.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <label htmlFor="openai-key" className="text-sm font-medium">OpenAI API Key</label>
          <Input id="openai-key" type="password" placeholder="sk-..." />
        </div>
        <div className="grid gap-3">
          <label htmlFor="google-key" className="text-sm font-medium">Google AI API Key</label>
          <Input id="google-key" type="password" placeholder="AIza..." />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save API Keys</Button>
      </CardFooter>
    </Card>
  );
}