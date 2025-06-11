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
import { Link, useLocation } from 'react-router';
import { memo } from 'react';
import { MessageSquareMore } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import ChatDelete from './ChatDelete';

export default function ChatSidebar() {
  const { user } = useUser();
  const chats = useQuery(
    api.chats.getChatsByUser,
    user ? { userId: user.id } : "skip"
  );
  const location = useLocation();
  const isThreadRoute = location.pathname.startsWith('/chat/');

  return (
    <Sidebar>
      <div className="flex flex-col h-full p-2">
        <Header />
        <SidebarContent className="no-scrollbar">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {chats?.map((chat) => (
                  <div key={chat.uuid} className="relative group">
                    <Link
                      to={`/chat/${chat.uuid}`}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted pr-8"
                    >
                      <MessageSquareMore className="w-4 h-4" />
                      <span className="truncate">{chat.title || 'New Chat'}</span>
                    </Link>
                    {user && (
                      <ChatDelete
                        chatUuid={chat.uuid}
                        chatTitle={chat.title || 'New Chat'}
                        userId={user.id}
                        redirectToHome={isThreadRoute}
                      />
                    )}
                  </div>
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
        to="/"
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
