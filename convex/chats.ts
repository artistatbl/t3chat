import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    uuid: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
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
      title: args.title,
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
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    await ctx.db.patch(chat._id, {
      title: args.title,
      updatedAt: Date.now(),
    });

    return chat;
  },
});

export const getChatByUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // User not authenticated
    }
    
    const userId = identity.subject;
    
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();
    
    // Return null if chat doesn't exist or doesn't belong to the user
    if (!chat || chat.userId !== userId) {
      return null;
    }
    
    return chat;
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
      .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat
    await ctx.db.delete(chat._id);

    return { success: true };
  },
});