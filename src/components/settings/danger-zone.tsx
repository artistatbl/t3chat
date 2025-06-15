'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function DangerZone() {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <CardTitle className="text-xl font-bold text-destructive">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="destructive" 
          className="bg-destructive hover:bg-destructive/90 shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={true}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </CardContent>
    </Card>
  );
}