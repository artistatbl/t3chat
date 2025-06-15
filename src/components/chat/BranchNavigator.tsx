'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '../ui/button';
import { GitBranch, ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';

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
    <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Branch info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-500" />
            {isBranch ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Branch</span>
                {branchDepth && branchDepth > 0 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
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
              className="h-8 px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Main
            </Button>
          )}
          
          {hasBranches && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">
                {branches.length}
              </span>
              {branches.slice(0, 3).map((branch, index) => (
                <Button
                  key={branch.uuid}
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/chat/${branch.uuid}`)}
                  className="h-7 px-2 text-xs"
                  title={branch.title}
                >
                  {index + 1}
                </Button>
              ))}
              {branches.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  title={`${branches.length - 3} more branches`}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}