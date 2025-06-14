'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { buttonVariants } from '../ui/button';
import UserProfile from '../user/UserProfile';
import Link from 'next/link'; // Changed to Next.js Link
import { useRouter, useParams } from 'next/navigation'; // Changed to Next.js navigation
import { memo, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import ChatDelete from './ChatDelete';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { CommandPalette } from '../command-palette/CommandPalette';
import { CommandIcon} from 'lucide-react';
import { cn } from '@/lib/utils';

// Function to get cookie value
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

export default function ChatSidebar() {
  const { user } = useUser();
  const params = useParams(); // Changed to Next.js useParams
  const threadId = params?.threadId as string; // Adjusted for Next.js params
  const router = useRouter(); // Changed to Next.js router
  const chats = useQuery(
    api.chats.getChatsByUser,
    user ? { userId: user.id } : "skip"
  );
  const { state, setOpen } = useSidebar();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Restore sidebar state from cookie on mount
  useEffect(() => {
    const sidebarState = getCookie('sidebar_state');
    if (sidebarState !== null) {
      setOpen(sidebarState === 'true');
    }
  }, [setOpen]);

  // Add keyboard shortcut for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        router.push('/chat'); // Changed to router.push
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleOpenCommandPalette = () => {
    setCommandPaletteOpen(true);
  };

  return (
    <>
      {/* Command Palette component with open state control */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      
      {/* Floating buttons that are visible when sidebar is collapsed */}
      {state === 'collapsed' && (
        <div className="fixed left-4 top-4 z-20 flex items-center gap-2 md:flex ">
          <div className="dark:bg-stone-800 bg-zinc-100 rounded-sm p-1">
            <SidebarTrigger />
          <button 
            onClick={handleOpenCommandPalette}
            className="cursor-pointer dark:bg-stone-800 bg-zinc-100 rounded-sm p-1 hover:bg-zinc-200 dark:hover:bg-stone-700 transition-colors"
            aria-label="Open command palette"
            >
            <CommandIcon className="h-4 w-4" />
          </button>
            </div>
        </div>
      )}
      
      <Sidebar>
        <div className="flex flex-col h-full p-2">
          <Header/>
          <SidebarContent className="no-scrollbar">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats?.map((chat) => (
                    <SidebarMenuItem key={chat.uuid} className="group">
                      <div 
                        className={cn(
                          'cursor-pointer group/thread h-9 flex items-center px-2 py-1 rounded-[8px] overflow-hidden w-full hover:bg-secondary',
                          threadId === chat.uuid && 'bg-secondary'
                        )}
                        onClick={() => {
                          if (threadId === chat.uuid) {
                            return;
                          }
                          router.push(`/chat/${chat.uuid}`); // Changed to router.push
                        }}
                      >
                        <span className="truncate block">{chat.title || 'New Chat'}</span>
                        {user && (
                          <div className="flex-shrink-0 opacity-0 group-hover/thread:opacity-100 transition-opacity ml-auto">
                            <ChatDelete
                              chatUuid={chat.uuid}
                              chatTitle={chat.title || 'New Chat'}
                              userId={user.id}
                              redirectToHome={!!threadId}
                            />
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <Footer />
        </div>
      </Sidebar>
    </>
  );
}

function PureHeader() {
  return (
    <SidebarHeader className="flex justify-between items-center gap-4 relative">
      <SidebarTrigger className="absolute left-1 top-2.5" />
      <h1 className="text-2xl font-light">
        T3Chat
      </h1>
      <Link
        href="/" // Changed to href for Next.js Link
        className={buttonVariants({
          variant: 'default',
          className: 'w-full',
        })}
      >
        New Chat
      </Link>
    </SidebarHeader>
  );
}

const Header = memo(PureHeader);

const PureFooter = () => {
  const params = useParams(); // Changed to Next.js useParams
  const threadId = params?.threadId as string; // Adjusted for Next.js params
  
  return (
    <SidebarFooter>
      <Link
        href={{
          pathname: "/settings",
          query: threadId ? { from: threadId } : undefined,
        }} // Changed to href with pathname and query for Next.js Link
        className={buttonVariants({ variant: "outline" })}
      >
        Settings
      </Link>
      <UserProfile />
    </SidebarFooter>
  );
};

const Footer = memo(PureFooter);
