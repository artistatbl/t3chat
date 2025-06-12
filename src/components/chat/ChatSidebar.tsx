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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { MessageSquareMore } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import ChatDelete from './ChatDelete';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';

export default function ChatSidebar() {
  const { user } = useUser();
  const chats = useQuery(
    api.chats.getChatsByUser,
    user ? { userId: user.id } : "skip"
  );
  const pathname = usePathname();
  const isThreadRoute = pathname?.startsWith('/chat/');
  const { state } = useSidebar();

  return (
    <>
      {/* Floating trigger button that's visible when sidebar is collapsed */}
      {state === 'collapsed' && (
        <div className="fixed left-4 top-4 z-20 md:block hidden">
          <SidebarTrigger />
        </div>
      )}
      <Sidebar>
        <div className="flex flex-col h-full p-2">
          <Header />
          <SidebarContent className="no-scrollbar">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats?.map((chat) => (
                    <SidebarMenuItem key={chat.uuid} className="group">
                      <div className="flex items-center w-full">
                        <Link
                          href={`/chat/${chat.uuid}`}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted flex-1 min-w-0"
                        >
                          <MessageSquareMore className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{chat.title || 'New Chat'}</span>
                        </Link>
                        {user && (
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChatDelete
                              chatUuid={chat.uuid}
                              chatTitle={chat.title || 'New Chat'}
                              userId={user.id}
                              redirectToHome={isThreadRoute}
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
        href="/"
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
  return (
    <SidebarFooter>
      <UserProfile />
    </SidebarFooter>
  );
};

const Footer = memo(PureFooter);
