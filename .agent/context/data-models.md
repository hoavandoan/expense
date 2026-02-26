# Data Models — Living Context

> This file documents the current database schema and TypeScript interfaces.
> Update when adding/modifying tables or interfaces.

## Core Interfaces (from `lib/types/index.ts`)

### User
| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID (Supabase Auth UID) |
| `name` | `string` | Display name |
| `email` | `string` | Email address |
| `avatarUrl` | `string?` | Profile picture URL |
| `createdAt` | `string` | ISO timestamp |

### Group
| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID |
| `name` | `string` | Group name |
| `description` | `string?` | Group description |
| `groupType` | `GroupType` | Type of group |
| `currency` | `string` | Currency code |
| `inviteCode` | `string` | Code for joining |
| `coverImageUrl` | `string?` | Cover image |
| `createdBy` | `string` | Creator user ID |
| `debtAssignmentEnabled` | `boolean` | Feature flag |
| `createdAt` | `string` | ISO timestamp |

### Expense
| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID |
| `groupId` | `string` | FK → Group |
| `title` | `string` | Expense title |
| `description` | `string?` | Details |
| `amount` | `number` | Total amount |
| `category` | `ExpenseCategory` | Category enum |
| `paidBy` | `string` | FK → User (who paid) |
| `createdBy` | `string` | FK → User (who created) |
| `expenseDate` | `string` | Date of expense |
| `receiptUrl` | `string?` | Receipt image |
| `createdAt` | `string` | ISO timestamp |

### ExpenseSplit
| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID |
| `expenseId` | `string` | FK → Expense |
| `userId` | `string` | FK → User |
| `amount` | `number` | Split amount |
| `isPaid` | `boolean` | Payment status |
| `paidAt` | `string?` | When paid |

### Settlement
| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID |
| `groupId` | `string` | FK → Group |
| `fromUserId` | `string` | FK → User (debtor) |
| `toUserId` | `string` | FK → User (creditor) |
| `amount` | `number` | Settlement amount |
| `status` | `string` | pending / completed / rejected |
| `completedAt` | `string?` | When completed |
| `createdAt` | `string` | ISO timestamp |

### Other Models

- **GroupMember**: Links users to groups with roles (`admin` / `member`).
- **Debt**: Calculated debt between two users (`from`, `to`, `amount`).
- **DebtAssignment**: Permanent debt delegation between users.
- **DebtAssignmentRequest**: Request to create a debt assignment.
- **ActivityLog**: Timestamped activity entries with metadata.
- **Notification**: User notifications with type, body, read status.
- **UserBalance**: Aggregated balance per user in a group.
- **GroupWithDetails**: Group extended with members, expenses, balance.

## Hooks ↔ Models Mapping

| Hook File | Models | Purpose |
|---|---|---|
| `use-groups.ts` | Group, GroupWithDetails | CRUD groups |
| `use-expenses.ts` | Expense, ExpenseSplit | CRUD expenses |
| `use-settlements.ts` | Settlement | Create/confirm settlements |
| `use-group-balance.ts` | UserBalance, Debt | Balance calculations |
| `use-debt-assignments.ts` | DebtAssignment | Manage debt assignments |
| `use-debt-assignment-requests.ts` | DebtAssignmentRequest | Request/approve assignments |
| `use-activity.ts` | ActivityLog | Activity feed |
| `use-notifications.ts` | Notification | Notification list |
| `use-auth.ts` | User | Auth state |
| `use-search.ts` | Various | Search across entities |
| `use-realtime.ts` | Various | Supabase realtime subscriptions |

## Zustand Stores

| Store | File | State |
|---|---|---|
| Auth | `auth-store.ts` | User session, auth tokens |
| Groups | `groups-store.ts` | Selected group, group list cache |
| UI | `ui-store.ts` | Theme, bottom sheet state, temp UI flags |
