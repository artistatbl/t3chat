'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AccountForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Make changes to your account here. Click save when you&lsquo;re done.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <Input id="name" defaultValue="Daly Jean" />
        </div>
        <div className="grid gap-3">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input id="email" defaultValue="jdaly2991@gmail.com" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  );
}