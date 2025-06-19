# Public and Private Chat Functionality

## Overview

T3Chat provides a flexible chat visibility system that allows users to control who can access their conversations. This document explains how the public and private chat functionality works.

## How Chat Visibility Works

### Core Concepts

- **Private Chats**: Only visible to the chat creator
- **Public Chats**: Visible to anyone using the application
- **Toggle Control**: Simple UI for switching between public and private modes

### Technical Implementation

The chat visibility system is implemented through several key components:

1. **Database Schema**: Each chat has an `isPublic` boolean field that determines its visibility
2. **Access Control**: Server-side validation ensures only authorized users can access private chats
3. **UI Components**: Visual indicators show the current visibility status

### User Interface

The visibility toggle appears in the chat interface as a button with two states:

- **Lock Icon**: Indicates the chat is private (only visible to you)
- **Globe Icon**: Indicates the chat is public (visible to everyone)

```typescript
// ChatVisibilityToggle component renders either a Lock or Globe icon
// based on the current visibility state
{isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
```

### Server-Side Validation

The server enforces access control rules to ensure privacy:

```typescript
// Allow access if:
// 1. Chat is public, OR
// 2. User is authenticated and owns the chat
const userId = identity?.subject;
const canAccess = chat.isPublic || (userId && chat.userId === userId);
```

### Changing Visibility

Users can change a chat's visibility at any time:

1. Click the visibility toggle button
2. The system updates the database record
3. A toast notification confirms the change
4. The UI updates to reflect the new status

## Use Cases

### Private Chats

- Personal conversations you want to keep private
- Sensitive information or queries
- Work-in-progress discussions

### Public Chats

- Knowledge sharing with the community
- Example conversations for others to learn from
- General discussions meant for wider audience