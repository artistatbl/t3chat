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
import UserProfile from './UserProfile';
import Link from 'next/link';
import { memo } from 'react';
import { useThreadStore } from '@/app/frontend/stores/ThreadStore';
import { MessageSquareMore } from 'lucide-react';

export default function ChatSidebar() {
  const threads = useThreadStore((state) => state.threads);

  return (
    <Sidebar>
      <div className="flex flex-col h-full p-2">
        <Header />
        <SidebarContent className="no-scrollbar">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {threads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/chat/${thread.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                  >
                    <MessageSquareMore className="w-4 h-4" />
                    <span className="truncate">{thread.name}</span>
                  </Link>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <Footer />
      </div>
    </Sidebar>
  );
}

function PureHeader() {
  return (
    <SidebarHeader className="flex justify-between items-center gap-4 relative">
      <SidebarTrigger className="absolute right-1 top-2.5" />
      <h1 className="text-2xl font-bold">
        Chat<span className="">0</span>
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
