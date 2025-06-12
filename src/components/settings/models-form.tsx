'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function ModelsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Models</CardTitle>
        <CardDescription>
          Configure your preferred AI models and settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <p className="text-sm font-medium">Default Model</p>
          <div className="flex items-center space-x-2">
            <input type="radio" id="gpt-4" name="default-model" className="h-4 w-4" />
            <label htmlFor="gpt-4" className="text-sm">GPT-4</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="radio" id="claude-3" name="default-model" className="h-4 w-4" />
            <label htmlFor="claude-3" className="text-sm">Claude 3</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="radio" id="gemini" name="default-model" className="h-4 w-4" />
            <label htmlFor="gemini" className="text-sm">Gemini</label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}