import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()),
    occupation: v.optional(v.string()),
    traits: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const now = Date.now();
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      displayName: args.displayName,
      occupation: args.occupation,
      traits: args.traits,
      bio: args.bio,
      createdAt: now,
      updatedAt: now,
    });
  }
});

// Add a new mutation to update user profile
export const updateUserProfile = mutation({
  args: {
    clerkId: v.string(),
    displayName: v.optional(v.string()),
    occupation: v.optional(v.string()),
    traits: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    return await ctx.db.patch(user._id, {
      displayName: args.displayName,
      occupation: args.occupation,
      traits: args.traits,
      bio: args.bio,
      updatedAt: now,
    });
  }
});

export const getUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  }
});