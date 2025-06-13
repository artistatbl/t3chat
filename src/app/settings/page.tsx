'use client';

import { buttonVariants } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from '@/components/settings/profile-section';
import { ProjectFeatures } from '@/components/settings/plan-benefits';
import { DangerZone } from '@/components/settings/danger-zone';
import { KeyboardShortcuts } from '@/components/settings/keyboard-shortcuts';
import ThemeToggler from '@/components/ui/ThemeToggler';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ModelSettings } from '@/components/settings/model-settings';

export default function SettingsPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  
  const handleBackToChat = () => router.push('/');
  const handleSignOut = () => signOut(() => router.push('/'));

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackToChat}
            className={buttonVariants({
              variant: 'ghost',
              className: 'text-sm  cursor-pointer transition-all',
            })}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to chat
          </button>
          
          <div className="flex items-center space-x-4">
            <ThemeToggler />
            <button 
              onClick={handleSignOut}
              className={buttonVariants({
                variant: 'ghost',
                className: 'text-sm  cursor-pointer transition-all',
              })}

            >

              Sign out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Left Sidebar */}
          <div className="md:col-span-4 space-y-2">
            <div className=" rounded-xl p-4 backdrop-blur-sm">
              <ProfileSection />
            </div>
            <div className=" rounded-xl p-4 backdrop-blur-sm">
              <KeyboardShortcuts />
            </div>
          </div>

          {/* Right Content */}
          <div className="md:col-span-8">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="flex  backdrop-blur-sm rounded-lg p-1 mb-6">
                <TabsTrigger value="account" className="flex-1 rounded-lg">Account</TabsTrigger>
                <TabsTrigger value="customization" className="flex-1 rounded-lg">Appearance</TabsTrigger>
                <TabsTrigger value="models" className="flex-1 rounded-lg">Models</TabsTrigger>
                <TabsTrigger value="api-keys" className="flex-1 rounded-lg">API</TabsTrigger>
              </TabsList>
              
              <div className=" rounded-xl p-6 backdrop-blur-sm">
                <TabsContent value="account">
                  <ProjectFeatures />
                  <DangerZone />
                </TabsContent>
                
                <TabsContent value="customization">
                  <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
                  <p className="text-gray-400">Customize your chat interface and theme preferences.</p>
                </TabsContent>
                
                <TabsContent value="models">
                  <ModelSettings/>

                </TabsContent>
                
                <TabsContent value="api-keys">
                  <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
                  <p className="text-gray-400">Manage your API keys and integrations.</p>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}