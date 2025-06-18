import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
    isPublic: v.optional(v.boolean()), // Add this field
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (existingChat) {
      return existingChat;
    }

    const now = Date.now();
    return await ctx.db.insert("chats", {
      uuid: args.uuid,
      userId: args.userId,
      title: args.title || "New Chat",
      isPublic: args.isPublic ?? false, // Default to private
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateChatTitle = mutation({
  args: {
    uuid: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[updateChatTitle] Received:", { uuid: args.uuid, title: args.title });
    
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      console.log("[updateChatTitle] Chat not found for uuid:", args.uuid);
      throw new Error("Chat not found");
    }

    console.log("[updateChatTitle] Found chat:", chat);
    
    await ctx.db.patch(chat._id, {
      title: args.title,
      updatedAt: Date.now(),
    });
    
    console.log("[updateChatTitle] Updated chat with title:", args.title);
    
    return chat;
  },
});

export const getChatByUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();
    
    if (!chat) {
      return null;
    }
    
    // Allow access if:
    // 1. Chat is public, OR
    // 2. User is authenticated and owns the chat
    const userId = identity?.subject;
    const canAccess = chat.isPublic || (userId && chat.userId === userId);
    
    return canAccess ? chat : null;
  },
});

export const getChatsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getPublicChats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .collect();
  },
});

export const deleteChat = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify the user owns this chat
    if (chat.userId !== args.userId) {
      throw new Error("Unauthorized: You can only delete your own chats");
    }

    // Delete all messages associated with this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chat.uuid))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat
    await ctx.db.delete(chat._id);

    return { success: true };
  },
});

export const toggleChatPinned = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify the user owns this chat
    if (chat.userId !== args.userId) {
      throw new Error("Unauthorized: You can only pin your own chats");
    }

    // Toggle the pinned status
    await ctx.db.patch(chat._id, {
      pinned: !chat.pinned,
      updatedAt: Date.now(),
    });

    return { success: true, pinned: !chat.pinned };
  },
});

export const updateChatVisibility = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify the user owns this chat
    if (chat.userId !== args.userId) {
      throw new Error("Unauthorized: You can only modify your own chats");
    }

    await ctx.db.patch(chat._id, {
      isPublic: args.isPublic,
      updatedAt: Date.now(),
    });

    return { success: true, isPublic: args.isPublic };
  },
});

export const createBranch = mutation({
  args: {
    parentChatUuid: v.string(),
    branchFromMessageId: v.string(),
    userId: v.string(),
    newChatUuid: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the parent chat
    const parentChat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.parentChatUuid))
      .first();

    if (!parentChat) {
      throw new Error("Parent chat not found");
    }

    // Verify user owns the parent chat or it's public
    if (parentChat.userId !== args.userId && !parentChat.isPublic) {
      throw new Error("Unauthorized: Cannot branch from this chat");
    }

    // Get all messages up to the branch point
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.parentChatUuid))
      .collect();

    // Find the branch point message
    const branchMessage = messages.find(m => m.uuid === args.branchFromMessageId);
    if (!branchMessage) {
      throw new Error("Branch point message not found");
    }

    // Get messages up to and including the branch point
    const messagesToCopy = messages
      .filter(m => m.createdAt <= branchMessage.createdAt)
      .sort((a, b) => a.createdAt - b.createdAt);

    const now = Date.now();
    const branchDepth = (parentChat.branchDepth || 0) + 1;

    // Create the new branch chat
    const branchChat = await ctx.db.insert("chats", {
      uuid: args.newChatUuid,
      userId: args.userId,
      title: args.title || parentChat.title, // Remove (Branch) suffix
      isPublic: false, // Branches are private by default
      parentChatId: args.parentChatUuid,
      branchFromMessageId: args.branchFromMessageId,
      branchDepth,
      createdAt: now,
      updatedAt: now,
    });

    // Copy messages to the new branch
    for (const message of messagesToCopy) {
      await ctx.db.insert("messages", {
        uuid: `${message.uuid}-branch-${args.newChatUuid}`,
        chatId: args.newChatUuid,
        userId: message.userId,
        role: message.role,
        content: message.content,
        attachments: message.attachments,
        createdAt: message.createdAt,
      });
    }

    return branchChat;
  },
});

export const getBranches = query({
  args: { parentChatUuid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_parent", (q) => q.eq("parentChatId", args.parentChatUuid))
      .collect();
  },
});

export const getChatWithBranchInfo = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();
    
    if (!chat) {
      return null;
    }
    
    const userId = identity?.subject;
    const canAccess = chat.isPublic || (userId && chat.userId === userId);
    
    if (!canAccess) {
      return null;
    }

    // Get branches of this chat
    const branches = await ctx.db
      .query("chats")
      .withIndex("by_parent", (q) => q.eq("parentChatId", args.uuid))
      .collect();

    // Get parent chat if this is a branch
    let parentChat = null;
    if (chat.parentChatId) {
      const parentChatId = chat.parentChatId; // Store in a const to help TypeScript
      parentChat = await ctx.db
        .query("chats")
        .withIndex("by_uuid", (q) => q.eq("uuid", parentChatId))
        .first();
    }

    return {
      ...chat,
      branches,
      parentChat,
    };
  },
});