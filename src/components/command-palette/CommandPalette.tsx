import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { MessageSquareMore, Plus } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  
  const chats = useQuery(
    api.chats.getChatsByUser,
    user ? { userId: user.id } : "skip"
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => unknown) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="rounded-lg border-0 shadow-2xl">
      <div className="flex items-center border-b px-3">
        <CommandInput placeholder="Search chats or create new one..." className="border-0 focus:ring-0" />
      </div>
      <CommandList className="p-2">
        <CommandEmpty className="py-6 text-center text-sm">
          No chats found. Start a new one?
        </CommandEmpty>
        
        <CommandGroup heading="Quick Actions" className="pb-2">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/'))}
            className="flex items-center py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <Plus className="mr-2 h-4 w-4 text-green-500" />
            <span className="font-medium">Create New Chat</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        
        <CommandGroup heading="Recent Chats" className="pt-2">
          {chats?.map((chat) => (
            <CommandItem
              key={chat.uuid}
              onSelect={() => runCommand(() => router.push(`/chat/${chat.uuid}`))}
              className="flex items-center py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <MessageSquareMore className="mr-2 h-4 w-4 text-blue-500" />
              <span>{chat.title || 'Untitled Chat'}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}