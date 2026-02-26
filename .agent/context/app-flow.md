# App Flow & Navigation — Living Context

> This file maps all screens and user flows. Update when adding/removing screens.

## Route Map

### Tab Navigation (`app/(tabs)/`)

| Tab | File | Screen |
|---|---|---|
| Home | `index.tsx` | Group list, balances summary, recent activity |
| Activity | `activity.tsx` | Full activity log with filters |
| Plus (+) | `plus.tsx` | Quick action menu (add expense, add group, settle up) |
| Settings | `settings.tsx` | User profile, app settings, logout |

### Modal Screens (`app/(modal)/`)

| Modal | File | Purpose |
|---|---|---|
| Add Expense | `add-expense.tsx` | Create new expense with splits |
| Add Group | `add-group.tsx` | Create new group |
| Join Group | `join-group.tsx` | Join via invite code or QR scan |
| Settle Up | `settle-up.tsx` | Record a settlement payment |
| Payment Confirm | `payment-confirm.tsx` | Confirm VietQR payment |

### Dynamic Routes

| Route | Pattern | Purpose |
|---|---|---|
| Group Detail | `group/[id]/` | Group info, member list, expenses |
| Group Expenses | `group/[id]/expenses.tsx` | Filtered expense list for group |
| Group Settings | `group/[id]/settings.tsx` | Member management, group config |
| Expense Detail | `expense/[id]/` | Single expense with splits |
| Notifications | `notifications/` | Notification list |

## User Flows

### Expense Creation
```
Home → (+) Button → Add Expense Modal → Select Group → Enter Amount
→ Select Payer → Configure Splits → Save → POST /api/expenses → Close Modal
```

### Group Join
```
Home → (+) Button → Join Group Modal → Scan QR / Enter Code
→ Auto-join → Navigate to Group Detail
```

### Settlement
```
Group Detail → Settle Up → Enter Amount → VietQR / Manual
→ Payment Request Sent → Other user confirms → Debt Cleared
```

### Debt Assignment
```
Group Detail → Debt Assignment → Select member → Set reason
→ Request created → Admin approves → Assignment active
```
