---
name: Tối ưu và phát triển SplitSmart
overview: Đánh giá toàn diện và đề xuất tối ưu cho giao diện, logic, tính năng và database của ứng dụng SplitSmart - ứng dụng chia tiền nhóm.
todos:
  - id: ui-loading-states
    content: Thêm skeleton loaders và loading states nhất quán cho tất cả screens
    status: completed
  - id: ui-empty-states
    content: Tạo component EmptyState tái sử dụng và áp dụng cho các screens
    status: completed
  - id: balance-calculation-refactor
    content: Tạo hook useGroupBalance để centralize balance calculation logic
    status: completed
  - id: notifications-db
    content: Tạo database table notifications và migration
    status: completed
  - id: notifications-backend
    content: Tạo Supabase triggers/functions để auto-create notifications
    status: completed
    dependencies:
      - notifications-db
  - id: notifications-frontend
    content: Implement useNotifications hook và update notifications screen
    status: completed
    dependencies:
      - notifications-backend
  - id: activity-log-db
    content: Tạo/update activity_log table với proper indexing
    status: completed
  - id: activity-feed-backend
    content: Tạo triggers để log activities vào activity_log
    status: completed
    dependencies:
      - activity-log-db
  - id: activity-feed-frontend
    content: Update activity.tsx để fetch từ database với filtering
    status: completed
    dependencies:
      - activity-feed-backend
  - id: expense-edit
    content: Thêm màn hình edit expense và delete functionality
    status: completed
  - id: group-settings
    content: Tạo màn hình group settings với member management
    status: completed
  - id: search-implementation
    content: Implement search functionality trong search screen
    status: completed
  - id: db-indexes
    content: Thêm database indexes cho performance optimization
    status: completed
  - id: db-functions
    content: Tạo PostgreSQL functions cho balance calculation và statistics
    status: completed
  - id: type-safety
    content: Cải thiện type safety, remove any types
    status: in_progress
  - id: todo-1768148478303-r4axkjcbw
    content: Tuân thủ các cursor rules và thư viện UI heroui-native
    status: completed
---

# Kế hoạch Tối ưu và Phát triển SplitSmart

## 1. Tối ưu Giao diện (UI/UX)

### 1.1 Cải thiện Trải nghiệm Người dùng

- **Loading States**: Thêm skeleton loaders nhất quán cho tất cả screens (`app/(tabs)/index.tsx`, `app/group/[id]/index.tsx`)
- **Empty States**: Tạo component `EmptyState` tái sử dụng cho các trường hợp không có dữ liệu
- **Error States**: Cải thiện error handling UI với retry actions và error messages rõ ràng
- **Pull-to-Refresh**: Đảm bảo tất cả danh sách có pull-to-refresh (hiện tại chỉ có ở một số nơi)

### 1.2 Tối ưu Performance UI

- **Memoization**: Tối ưu `useMemo` và `useCallback` trong các components lớn (`app/(tabs)/index.tsx`, `app/group/[id]/index.tsx`)
- **Image Optimization**: Sử dụng `expo-image` với lazy loading và placeholder cho avatar/cover images
- **List Optimization**: Implement `FlatList` với `getItemLayout` cho danh sách lớn (groups, expenses)
- **Animation Performance**: Review và optimize animations trong `parallax-header` components

### 1.3 Cải thiện Accessibility

- **Screen Reader**: Thêm `accessibilityLabel` và `accessibilityHint` cho tất cả interactive elements
- **Color Contrast**: Đảm bảo đủ contrast ratio cho text trên backgrounds
- **Touch Targets**: Đảm bảo minimum touch target size (44x44pt)

## 2. Tối ưu Logic & Architecture

### 2.1 Refactor Business Logic

- **Centralize Balance Calculation**: Tạo hook `useGroupBalance` để tính balance một lần, tránh duplicate logic trong `app/(tabs)/index.tsx` và `app/group/[id]/index.tsx`
- **Debt Calculator Optimization**: Tối ưu `lib/utils/debt-calculator.ts` với caching và memoization
- **Type Safety**: Cải thiện type definitions, giảm `any` types trong codebase

### 2.2 State Management

- **React Query Optimization**:
- Thêm `staleTime` và `cacheTime` phù hợp cho các queries
- Implement optimistic updates cho mutations (create expense, settle up)
- Thêm retry logic với exponential backoff
- **Zustand Stores**: Review và optimize stores trong `lib/stores/`

### 2.3 Error Handling

- **Global Error Boundary**: Cải thiện `components/error-boundary.tsx` với error reporting
- **API Error Handling**: Standardize error handling trong tất cả hooks (`lib/hooks/`)
- **Offline Support**: Implement offline-first với React Query và AsyncStorage caching

### 2.4 Real-time Optimization

- **Subscription Management**: Tối ưu `lib/hooks/use-realtime.ts` để tránh duplicate subscriptions
- **Selective Updates**: Chỉ invalidate queries cần thiết thay vì invalidate tất cả

## 3. Tính năng Mới

### 3.1 Notifications System (Priority: High)

- **Database**: Tạo table `notifications` với các fields: `id`, `user_id`, `type`, `title`, `body`, `metadata`, `is_read`, `created_at`
- **Backend**: Tạo Supabase functions/triggers để tự động tạo notifications khi:
- Expense được tạo/cập nhật
- Settlement được request/complete
- User được thêm vào group
- **Frontend**:
- Implement `useNotifications` hook với real-time updates
- Update `app/notifications/index.tsx` để fetch từ database
- Thêm push notifications với `expo-notifications`

### 3.2 Activity Feed (Priority: High)

- **Database**: Tạo/update table `activity_log` với proper indexing
- **Backend**: Tạo triggers để log activities:
- Expense created/updated/deleted
- Settlement created/completed
- Group member added/removed
- **Frontend**:
- Update `app/(tabs)/activity.tsx` để fetch từ database
- Thêm filtering và search functionality
- Implement pagination với infinite scroll

### 3.3 Expense Management (Priority: Medium)

- **Edit Expense**: Thêm màn hình edit expense (`app/expense/[id]/edit.tsx`)
- **Delete Expense**: Thêm confirmation dialog và delete functionality
- **Receipt Upload**: Implement image upload với `expo-image-picker` và Supabase Storage
- **Expense Templates**: Cho phép tạo templates cho expenses thường xuyên

### 3.4 Group Management (Priority: Medium)

- **Group Settings**: Thêm màn hình settings cho group (`app/group/[id]/settings.tsx`)
- Edit group name, description, cover image
- Manage members (add/remove/change roles)
- Group statistics
- **Leave Group**: Implement leave group functionality với confirmation
- **Delete Group**: Thêm delete group (chỉ owner)

### 3.5 Search & Filter (Priority: Medium)

- **Global Search**: Implement search trong `app/search/index.tsx`:
- Search expenses by title/description
- Search groups by name
- Search users
- **Expense Filtering**: Thêm filters trong group detail:
- By category
- By date range
- By member
- By amount range

### 3.6 Analytics & Statistics (Priority: Low)

- **Expense Analytics**:
- Charts cho spending by category (victory-native đã có trong dependencies)
- Monthly/weekly summaries
- Spending trends
- **Group Statistics**:
- Total spent per member
- Average expense per person
- Most active categories

### 3.7 Advanced Features (Priority: Low)

- **Recurring Expenses**: Cho phép tạo recurring expenses (hàng tuần/tháng)
- **Expense Export**: Export expenses to CSV/PDF
- **Multi-currency Support**: Hỗ trợ nhiều currency trong một group
- **Expense Approval**: Workflow approval cho expenses lớn

## 4. Database Optimization

### 4.1 Schema Improvements

- **Indexes**: Thêm indexes cho:
- `expenses(group_id, created_at)` - cho queries theo group và date
- `expense_splits(expense_id, user_id)` - cho balance calculations
- `group_members(group_id, user_id)` - cho membership checks
- `notifications(user_id, is_read, created_at)` - cho notification queries
- **Constraints**: Thêm check constraints:
- `expense_splits.amount > 0`
- `expenses.amount > 0`
- `settlements.amount > 0`

### 4.2 Database Functions

- **Balance Calculation**: Tạo PostgreSQL function để tính balance cho user trong group (giảm computation trên client)
- **Debt Optimization**: Tạo function để optimize debts (có thể chạy trên server)
- **Statistics**: Tạo functions cho các statistics queries

### 4.3 Row Level Security (RLS)

- **Review RLS Policies**: Đảm bảo tất cả tables có proper RLS policies:
- Users chỉ có thể xem groups họ là member
- Users chỉ có thể edit expenses họ tạo (hoặc là admin)
- Users chỉ có thể view notifications của chính họ

### 4.4 Data Integrity

- **Foreign Keys**: Đảm bảo tất cả foreign keys có proper CASCADE rules
- **Triggers**: Tạo triggers để:
- Auto-update `groups.updated_at` khi có expense mới
- Validate expense splits sum equals expense amount
- Auto-create notifications

## 5. Code Quality & Best Practices

### 5.1 TypeScript Improvements

- **Strict Mode**: Enable strict TypeScript mode
- **Remove `any` Types**: Replace tất cả `any` với proper types
- **Type Guards**: Thêm type guards cho runtime type checking

### 5.2 Testing

- **Unit Tests**: Thêm tests cho:
- `lib/utils/debt-calculator.ts`
- Balance calculation logic
- Format utilities
- **Integration Tests**: Test critical flows:
- Create expense flow
- Settle up flow
- Group creation flow

### 5.3 Documentation

- **API Documentation**: Document tất cả hooks và utilities
- **Component Documentation**: Thêm JSDoc comments cho components
- **README**: Update README với setup instructions và architecture overview

## 6. Security Enhancements

### 6.1 Authentication

- **Session Management**: Review và improve session handling
- **Token Refresh**: Đảm bảo token refresh hoạt động đúng

### 6.2 Data Validation

- **Input Validation**: Thêm Zod validation cho tất cả user inputs
- **SQL Injection**: Đảm bảo tất cả queries sử dụng parameterized queries (Supabase đã handle)

### 6.3 Privacy

- **Data Encryption**: Review sensitive data storage
- **Permissions**: Đảm bảo proper permissions cho group members

## 7. Performance Optimization

### 7.1 Bundle Size

- **Code Splitting**: Implement lazy loading cho screens không thường dùng
- **Tree Shaking**: Đảm bảo unused code được remove
- **Image Optimization**: Compress và optimize images

### 7.2 Runtime Performance

- **Query Optimization**: Review và optimize Supabase queries
- **Caching Strategy**: Implement proper caching với React Query
- **Debouncing**: Thêm debouncing cho search inputs

## Implementation Priority

1. **Phase 1 (Critical)**: Notifications system, Activity feed, Balance calculation refactor
2. **Phase 2 (High)**: Expense management (edit/delete), Group settings, Search functionality
3. **Phase 3 (Medium)**: Analytics, Receipt upload, Expense templates
4. **Phase 4 (Low)**: Advanced features, Export, Multi-currency

## Files to Create/Modify

### New Files:

- `lib/hooks/use-notifications.ts`
- `lib/hooks/use-group-balance.ts`
- `app/expense/[id]/edit.tsx`
- `app/group/[id]/settings.tsx`
- `components/ui/empty-state.tsx`
- `components/ui/error-state.tsx`
- `lib/utils/balance-calculator.ts` (refactored)

### Modified Files:

- `app/notifications/index.tsx` - Connect to backend
- `app/(tabs)/activity.tsx` - Connect to backend
- `app/(tabs)/index.tsx` - Use new balance hook
- `app/group/[id]/index.tsx` - Use new balance hook
- `lib/hooks/use-realtime.ts` - Optimize subscriptions
- `lib/utils/debt-calculator.ts` - Add caching

### Database Migrations:

- Create `notifications` table
- Create/update `activity_log` table
- Add indexes
- Add database functions
- Add triggers
