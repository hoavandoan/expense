---
name: heroui-native
description: Expert guide for building premium mobile UIs with HeroUI Native. Provides component specs, styling standards (Tailwind CSS 4), and integration patterns for Expo Router and Supabase. Use when designing, building, or refining mobile interfaces requiring HeroUI Native components like Cards, Avatars, Buttons, and BottomSheets.
---

# HeroUI Native Skill

This skill provides comprehensive intelligence for building high-quality mobile applications using **HeroUI Native** and **Expo Router**.

## Core Principles

- **Atomic Design**: Use components from `heroui-native` for atoms (Button, Avatar) and molecules (Card, Input).
- **Styling**: Strictly use **Tailwind CSS 4** (via `uniwind`) with the `cn` utility for class merging.
- **Responsiveness**: Use `ScreenSurface` and `ScreenScrollView` as base layouts.
- **Accessibility**: Support dark mode, RTL, and ARIA roles.

## Specialized References

- **Official Docs**: See [llm-docs.md](references/llm-docs.md) for the full HeroUI Native LLM documentation.
- **Patterns**: See [patterns.md](references/patterns.md) for extracted patterns from this codebase (ExpenseCard, GroupCard).
- **MCP Server**: See [mcp-server.md](references/mcp-server.md) for information on the dedicated HeroUI MCP server.

## Component Quick Start

### Card
Used for interactive list items or bounded data sections.
```tsx
import { Card } from "heroui-native";

<Card variant="default" className="p-4 rounded-2xl bg-surface border border-divider/10">
  <Card.Body>
    <Text>Content</Text>
  </Card.Body>
</Card>
```

### Avatar
For user profiles and group members.
```tsx
import { Avatar } from "heroui-native";

<Avatar size="sm" alt="User Name">
  <Avatar.Image source={{ uri: photoUrl }} />
  <Avatar.Fallback text="UN" />
</Avatar>
```

### BottomSheet
For drawers and complex selection menus.
```tsx
import { BottomSheet } from "heroui-native";

<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
  <BottomSheet.Portal>
    <BottomSheet.Content className="mx-4" backgroundClassName="rounded-3xl">
      {/* Content */}
    </BottomSheet.Content>
  </BottomSheet.Portal>
</BottomSheet>
```
