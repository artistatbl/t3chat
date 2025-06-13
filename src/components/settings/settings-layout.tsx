'use client';

import { buttonVariants } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { ProfileSection } from '@/components/settings/profile-section';
import { KeyboardShortcuts } from '@/components/settings/keyboard-shortcuts';
import ThemeToggler from '@/components/ui/ThemeToggler';
import { useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SettingsLayoutProps = {
  children: ReactNode;
};

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  
  const handleBackToChat = () => router.push('/');
  const handleSignOut = () => signOut(() => router.push('/'));

  // Determine which tab is active based on the current path
  const activeTab = pathname === '/settings' ? 'account' : pathname.split('/').pop();

  // Handle tab change by navigating to the corresponding URL
  const handleTabChange = (value: string) => {
    router.push(`/settings/${value}`);
  };

  return (
    <div className="min-h-screen py-5 px-2">
      <div className="max-w-5xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackToChat}
            className={buttonVariants({
              variant: 'ghost',
              className: 'text-sm cursor-pointer transition-all',
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
                className: 'text-sm cursor-pointer transition-all',
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
            <div className="rounded-xl p-4 backdrop-blur-sm">
              <ProfileSection />
            </div>
            <div className="rounded-xl p-4 backdrop-blur-sm">
              <KeyboardShortcuts />
            </div>
          </div>

          {/* Right Content */}
          <div className="md:col-span-8">
            <div className="rounded-xl p2 backdrop-blur-sm">
              {/* UI Tabs Component */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                <TabsList className="w-full bg-zinc-800/50">
                  <TabsTrigger value="account" className="flex-1 cursor-pointer">
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex-1">
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger value="models" className="flex-1">
                    Models
                  </TabsTrigger>
                  <TabsTrigger value="apikey" className="flex-1">
                    API Keys
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Page content */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}