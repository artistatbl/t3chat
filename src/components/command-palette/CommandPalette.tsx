import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { MessageSquareMore } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: externalOpen, onOpenChange: externalOnOpenChange }: CommandPaletteProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  
  const chats = useQuery(
    api.chats.getChatsByUser,
    user ? { userId: user.id } : "skip"
  )

  // Determine if we're using external or internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    externalOnOpenChange?.(value);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

  const runCommand = (command: () => unknown) => {
    setOpen(false)
    command()
  }


  return (
    <CommandDialog 
      open={open} 
      onOpenChange={setOpen} 
      className="w-full max-w-md border-2 border-fuchsia-950/50 dark:border-fuchsia-950/20"
    >

      <CommandInput 
        placeholder="Search chats or type a command..." 
      />

      <CommandList className="max-h-96 overflow-y-auto p-2">
        <CommandEmpty className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <MessageSquareMore className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {chats && chats.length > 0 ? "" : "No chats found"}
          </p>
          <p className="text-xs text-muted-foreground">
            {chats && chats.length > 0 ? "" : "Start a new conversation to get started"}
          </p>
        </CommandEmpty>

        {chats && chats.length > 0 && (
          <>
            <CommandGroup heading={`Recent Chats`}>
              {chats.slice(0, 8).map((chat) => (
                <CommandItem
                  key={chat.uuid}
                  onSelect={() => runCommand(() => router.push(`/chat/${chat.uuid}`))}
                  className="group flex items-center g cursor-pointer p-3 rounded-lg px-1 py-2 text-sm transition-all hover:bg-accent"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {chat.title || 'Untitled Chat'}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}