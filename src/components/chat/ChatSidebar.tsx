"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import UserProfile from "../user/UserProfile";
import { useRouter, useParams } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import ChatDelete from "./ChatDelete";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { CommandPalette } from "../command-palette/CommandPalette";
import { CommandIcon, Star, StarOff, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatItem, useGroupedChats } from "@/utils/chatGrouping";
import { usePinnedChats } from "@/utils/pinnedChats";
import { useSidebarState } from "@/hooks/useSidebarState";
import { toast } from "sonner";

export default function ChatSidebar() {
  const { user } = useUser();
  const params = useParams();
  const threadId = params?.threadId as string;
  const router = useRouter();
  const chats = useQuery(
    api.chats.getChatsByUser,
    user ? { userId: user.id } : "skip"
  );

  // Only destructure what we actually use to avoid the TypeScript warning
  const { isOpen } = useSidebarState();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const togglePinned = useMutation(api.chats.toggleChatPinned);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);

  // Use the extracted grouping logic
  const { pinned, unpinned } = usePinnedChats(chats);
  const groupedChats = useGroupedChats(unpinned);

  // Add keyboard shortcut for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "n"
      ) {
        e.preventDefault();
        router.push("/");
      }
      // Handle escape key to cancel editing
      if (e.key === "Escape" && editingChatId) {
        setEditingChatId(null);
        setEditingTitle("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, editingChatId]);

  const handleOpenCommandPalette = () => {
    setCommandPaletteOpen(true);
  };

  const handleTogglePinned = async (e: React.MouseEvent, chat: ChatItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      await togglePinned({ uuid: chat.uuid, userId: user.id });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent, chat: ChatItem) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingChatId(chat.uuid);
    setEditingTitle(chat.title || "New Chat");
  };

  const handleTitleSubmit = async (chatUuid: string) => {
    if (!editingTitle.trim()) {
      setEditingChatId(null);
      setEditingTitle("");
      return;
    }

    const trimmedTitle = editingTitle.trim();

    try {
      await updateChatTitle({
        uuid: chatUuid,
        title: trimmedTitle,
      });
      toast.success("Chat title updated successfully");
    } catch (error) {
      console.error("Failed to update chat title:", error);
      toast.error("Failed to update chat title");
    } finally {
      setEditingChatId(null);
      setEditingTitle("");
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, chatUuid: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSubmit(chatUuid);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingChatId(null);
      setEditingTitle("");
    }
  };

  // Render a chat item
  const renderChatItem = (chat: ChatItem) => (
    <SidebarMenuItem key={chat.uuid} className="group">
      <div
        className={cn(
          "cursor-pointer group/thread h-9 flex items-center px-2 py-1 rounded-[8px] overflow-hidden w-full hover:bg-secondary",
          threadId === chat.uuid && "bg-secondary"
        )}
        onClick={() => {
          if (threadId === chat.uuid || editingChatId === chat.uuid) {
            return;
          }
          router.push(`/chat/${chat.uuid}`);
        }}
        onDoubleClick={(e) => handleDoubleClick(e, chat)}
      >
        {editingChatId === chat.uuid ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={() => handleTitleSubmit(chat.uuid)}
            onKeyDown={(e) => handleTitleKeyDown(e, chat.uuid)}
            className="bg-transparent border-none outline-none text-sm w-full truncate"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-2 truncate">
            {chat.parentChatId && (
              <div className="flex-shrink-0 flex items-center">
                <GitBranch className="h-3.5 w-3.5 text-blue-500" />
                {chat.branchDepth && chat.branchDepth > 1 && (
                  <span className="text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-1 font-medium">
                    {chat.branchDepth}
                  </span>
                )}
              </div>
            )}
            <span className="truncate block">{chat.title || "New Chat"}</span>
          </div>
        )}
        {user && editingChatId !== chat.uuid && (
          <div className="flex-shrink-0 opacity-0 group-hover/thread:opacity-100 transition-opacity ml-auto flex items-center">
            <button
              onClick={(e) => handleTogglePinned(e, chat)}
              className="p-1 hover:text-fuchsia-800 hover:bg-fuchsia-700/20 rounded-sm cursor-pointer transition-colors"
              aria-label={chat.pinned ? "Unpin chat" : "Pin chat"}
            >
              {chat.pinned ? (
                <StarOff className="h-3.5 w-3.5" />
              ) : (
                <Star className="h-3.5 w-3.5" />
              )}
            </button>
            <ChatDelete
              chatUuid={chat.uuid}
              chatTitle={chat.title || "New Chat"}
              userId={user.id}
              redirectToHome={!!threadId}
            />
          </div>
        )}
      </div>
    </SidebarMenuItem>
  );

  return (
    <>
      {/* Command Palette component with open state control */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Floating buttons that are visible when sidebar is collapsed */}
      {!isOpen && (
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
          <Header />
          <SidebarContent className="no-scrollbar">
            {/* Pinned chats */}
            {pinned.length > 0 && (
              <SidebarGroup>
                <h3 className="px-2 text-xs font-semibold text-fuchsia-800 mb-1">
                  Pinned
                </h3>
                <SidebarGroupContent>
                  <SidebarMenu>{pinned.map(renderChatItem)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Today's chats */}
            {groupedChats.today.length > 0 && (
              <SidebarGroup>
                <h3 className="px-2 text-xs font-semibold text-fuchsia-800 mb-1 mt-3">
                  Today
                </h3>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupedChats.today.map(renderChatItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Yesterday's chats */}
            {groupedChats.yesterday.length > 0 && (
              <SidebarGroup>
                <h3 className="px-2 text-xs font-semibold text-fuchsia-800 mb-1 mt-3">
                  Yesterday
                </h3>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupedChats.yesterday.map(renderChatItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Last 7 days chats */}
            {groupedChats.lastWeek.length > 0 && (
              <SidebarGroup>
                <h3 className="px-2 text-xs font-semibold text-fuchsia-800 mb-1 mt-3">
                  Last 7 Days
                </h3>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupedChats.lastWeek.map(renderChatItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Last 30 days chats */}
            {groupedChats.lastMonth.length > 0 && (
              <SidebarGroup>
                <h3 className="px-2 text-xs font-semibold text-fuchsia-800 mb-1 mt-3">
                  Last 30 Days
                </h3>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupedChats.lastMonth.map(renderChatItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Older chats */}
            {groupedChats.older.length > 0 && (
              <SidebarGroup>
                <h3 className="px-2 text-xs font-semibold text-fuchsia-800 mb-1 mt-3">
                  Older
                </h3>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupedChats.older.map(renderChatItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <Footer />
        </div>
      </Sidebar>
    </>
  );
}

function PureHeader() {
  const router = useRouter();

  return (
    <SidebarHeader className="flex justify-between items-center gap-4 relative">
      <SidebarTrigger className="absolute left-1 top-1.5" />
      <h1 className="text-1xl font-semibold">T3Chat</h1>
      <Button
        className="w-full  bg-fuchsia-950/80  text-white hover:bg-fuchsia-950/20"
        onClick={() => router.push("/")}
      >
        New Chat
      </Button>
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
