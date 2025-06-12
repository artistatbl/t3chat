'use client';

import { buttonVariants } from '@/components/ui/button';
import { ArrowLeftIcon, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from '@/components/settings/profile-section';
import { PlanBenefits } from '@/components/settings/plan-benefits';
import { UsageStats } from '@/components/settings/usage-stats';
import { DangerZone } from '@/components/settings/danger-zone';
import { KeyboardShortcuts } from '@/components/settings/keyboard-shortcuts';
import ThemeToggler from '@/components/ui/ThemeToggler';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  
  const handleBackToChat = () => router.push('/');
  const handleSignOut = () => signOut(() => router.push('/'));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackToChat}
            className={buttonVariants({
              variant: 'ghost',
              className: 'text-gray-300 hover:text-white hover:bg-gray-800/50',
            })}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex items-center space-x-4">
            <ThemeToggler />
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <ProfileSection />
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <UsageStats />
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <KeyboardShortcuts />
            </div>
          </div>

          {/* Right Content */}
          <div className="md:col-span-8">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="flex bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 mb-6">
                <TabsTrigger value="account" className="flex-1 rounded-lg">Account</TabsTrigger>
                <TabsTrigger value="customization" className="flex-1 rounded-lg">Appearance</TabsTrigger>
                <TabsTrigger value="models" className="flex-1 rounded-lg">Models</TabsTrigger>
                <TabsTrigger value="api-keys" className="flex-1 rounded-lg">API</TabsTrigger>
              </TabsList>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
                <TabsContent value="account">
                  <PlanBenefits />
                  <DangerZone />
                </TabsContent>
                
                <TabsContent value="customization">
                  <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
                  <p className="text-gray-400">Customize your chat interface and theme preferences.</p>
                </TabsContent>
                
                <TabsContent value="models">
                  <h2 className="text-xl font-semibold mb-4">AI Model Settings</h2>
                  <p className="text-gray-400">Configure and manage AI models for your chat experience.</p>
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