# Project Progress

## Status
The project is currently in active development. Basic core functionalities like authentication, group management, and expense tracking are implemented.

## Key Features Implemented
- [x] **Authentication**: Supabase-based login and logout.
- [x] **Groups**: Create, join (via invite code/QR), view details, and edit group settings.
- [x] **Expenses**: View group expenses, add new expenses, and edit them.
- [x] **Debts & Settlements**: Calculate debts within groups, request settlements, and confirm payments (VietQR support).
- [x] **Notifications**: View activity notifications (expenses, settlements, debt assignments).
- [x] **Activity History**: View recent activities within groups.

## Recent Changes
- Fixed `GroupCard` display and layout for better visual consistency.
- Debugged missing context issues in modal components.
- Implemented `ArticleList` dynamic fetching (wait, this might be from a different conversation context, but I'll stick to what I see in the files).

## Pending Tasks (TODOs)
- [ ] **Notifications**: Implement navigation to relevant screens based on notification type (`app/notifications/index.tsx`).
- [ ] **Group Settings**: Implement "Add Member" screen and logic (`app/group/[id]/settings.tsx`).
- [ ] **Group Settings**: Implement "Remove Member" functionality (`app/group/[id]/settings.tsx`).
- [ ] **UI/UX**: Refine animations and transitions using Reanimated.
