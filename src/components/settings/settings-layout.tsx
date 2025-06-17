'use client';

import { buttonVariants } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { ProfileSection } from '@/components/settings/profile-section';
import { KeyboardShortcuts } from '@/components/settings/keyboard-shortcuts';
import ThemeToggler from '@/components/ui/ThemeToggler';
import { useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
type SettingsLayoutProps = {
  children: ReactNode;
};

type SettingsTab = {
  value: string;
  label: string;
  href: string;
};

// Constants
const SETTINGS_TABS: SettingsTab[] = [
  { value: 'account', label: 'Account', href: '/settings/account' },
  { value: 'privacy', label: 'Privacy', href: '/settings/privacy' },
  // { value: 'appearance', label: 'Appearance', href: '/settings/appearance' },
  { value: 'models', label: 'Models', href: '/settings/models' },
  { value: 'apikey', label: 'API Keys', href: '/settings/apikey' },

];

// Components
const Header = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={() => router.push('/')}
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
          onClick={() => signOut(() => router.push('/'))}
          className={buttonVariants({
            variant: 'ghost',
            className: 'text-xs cursor-pointer transition-all',
          })}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

const Sidebar = () => (
  <div className="md:col-span-4 space-y-2">
    <div className="rounded-xl p-4 backdrop-blur-sm">
      <ProfileSection />
    </div>
    <div className="rounded-xl p-4 backdrop-blur-sm">
      <KeyboardShortcuts />
    </div>
  </div>
);

const SettingsTabs = ({ activeTab }: { activeTab: string }) => (
  <Tabs value={activeTab} className="mb-8">
    <TabsList className="dark:bg-zinc-800 bg-zinc-100 space-x-2 rounded-lg flex justify-start">
      {SETTINGS_TABS.map((tab) => (
        <Link key={tab.value} href={tab.href} prefetch>
          <TabsTrigger 
            value={tab.value} 
            className="relative flex items-center  capitalize px-4 text-sm border-b-2 border-transparent hover:border-primary"

          >
            {tab.label}
          </TabsTrigger>
        </Link>
      ))}
    </TabsList>
  </Tabs>
);

const Content = ({ children }: { children: ReactNode }) => (
  <div className="md:col-span-8">
    <div className="rounded-xl p2 backdrop-blur-sm">
      {children}
    </div>
  </div>
);

// Main Component
export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const activeTab = pathname === '/settings' ? 'account' : (pathname.split('/').pop() ?? 'account');

  return (
    <div className="min-h-screen py-5 px-2">
      <div className="max-w-5xl mx-auto relative">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <Sidebar />
          <Content>
            <SettingsTabs activeTab={activeTab} />
            {children}
          </Content>
        </div>
      </div>
    </div>
  );
}