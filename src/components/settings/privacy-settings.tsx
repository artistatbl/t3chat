'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { toast } from 'sonner';

export function PrivacySettings() {
  const { hidePersonalInfo, setHidePersonalInfo, isLoading } = usePrivacySettings();

  const handleToggle = async () => {
    const newValue = !hidePersonalInfo;
    await setHidePersonalInfo(newValue);
    toast.success(`Personal information is now ${newValue ? 'hidden' : 'visible'}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control how your personal information is displayed throughout the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 mr-4">
            <Label htmlFor="hide-personal-info">Hide Personal Information</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, your profile picture and email will be blurred across the application.
            </p>
          </div>
          <Switch
            id="hide-personal-info"
            checked={hidePersonalInfo}
            onCheckedChange={handleToggle}
            disabled={isLoading}
            className="self-center"
          />
        </div>
      </CardContent>
    </Card>
  );
}