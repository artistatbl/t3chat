'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '../ui/button';
import { GitBranch, ArrowLeft, Plus, GitMerge } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface BranchNavigatorProps {
  currentChatId: string;
}

export default function BranchNavigator({ currentChatId }: BranchNavigatorProps) {
  const router = useRouter();
  const chatWithBranches = useQuery(
    api.chats.getChatWithBranchInfo,
    { uuid: currentChatId }
  );

  if (!chatWithBranches) return null;

  const { branches, parentChat, branchDepth } = chatWithBranches;
  const hasBranches = branches && branches.length > 0;
  const isBranch = !!parentChat;

  if (!hasBranches && !isBranch) return null;

  return (
    <div className="border-b border-border/40 bg-gradient-to-r from-muted/10 to-muted/30 backdrop-blur-sm px-4 py-2.5 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left side - Branch info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 dark:bg-blue-500/20 p-1.5 rounded-md">
              {isBranch ? (
                <GitBranch className="w-4 h-4 text-blue-500" />
              ) : (
                <GitMerge className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            {isBranch ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Branch</span>
                {branchDepth && branchDepth > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-none"
                    )}
                  >
                    L{branchDepth}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium">Main</span>
            )}
          </div>
        </div>

        {/* Right side - Navigation */}
        <div className="flex items-center gap-2">
          {isBranch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/chat/${parentChat.uuid}`)}
              className="h-8 px-3 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Main
            </Button>
          )}
          
          {hasBranches && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1 bg-muted/30 dark:bg-muted/20 px-2 py-0.5 rounded-md">
                {branches.length}
              </span>
              <div className="flex items-center gap-1 bg-background/50 dark:bg-background/20 backdrop-blur-sm p-1 rounded-md">
                {branches.slice(0, 3).map((branch, index) => (
                  <Button
                    key={branch.uuid}
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/chat/${branch.uuid}`)}
                    className="h-7 px-2.5 text-xs border-border/30 bg-transparent hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 transition-all"
                    title={branch.title}
                  >
                    {index + 1}
                  </Button>
                ))}
                {branches.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 flex items-center justify-center text-xs border-border/30 bg-transparent hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 transition-all"
                    title={`${branches.length - 3} more branches`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}