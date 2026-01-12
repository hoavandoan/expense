---
name: Thiết kế Database Schema cho Tính năng Gán Nợ
overview: ""
todos: []
---

# Thiết kế Database Schema cho Tính năng Gán Nợ

## 1. Phân tích Yêu cầu

### 1.1 Luồng Gán Nợ

```
┌─────────────────────────────────────────────────────────────┐
│                    Gán Nợ (Debt Assignment)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Mặc định: Chia đều cho tất cả người tham gia                │
│  └─> Tính toán nợ tự động (hiện tại)                         │
│                                                               │
│  Gán Nợ: Owner gán một người làm "Debt Assignee"            │
│  └─> Người âm tiền → Trả cho Debt Assignee                   │
│  └─> Debt Assignee → Trả cho người dư tiền                  │
│                                                               │
│  Đề xuất: Thành viên đề xuất gán nợ                          │
│  └─> Owner duyệt/ từ chối                                   │
│                                                               │
│  Thay đổi: Owner có thể thay đổi người được gán nợ           │
│  └─> Tạo lại các khoản nợ mới                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Các Trường hợp Sử dụng

1. **Owner gán nợ trực tiếp**: Owner chọn một thành viên làm debt assignee
2. **Thành viên đề xuất**: Thành viên gửi request đề xuất gán nợ cho một người
3. **Owner duyệt request**: Owner có thể approve/reject request
4. **Thay đổi debt assignee**: Owner có thể thay đổi người được gán nợ
5. **Tính toán lại nợ**: Khi gán nợ thay đổi, hệ thống tự động tính toán lại các khoản nợ

## 2. Database Schema Design

### 2.1 Bảng `debt_assignments`

Lưu trữ thông tin về việc gán nợ cho mỗi group.

```sql
CREATE TABLE debt_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    assignee_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    reason TEXT, -- Lý do gán nợ (optional)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ, -- Khi status = 'inactive'

    -- Constraints
    CONSTRAINT unique_active_assignment_per_group
        UNIQUE NULLS NOT DISTINCT (group_id, status)
        WHERE status = 'active',

    -- Indexes
    INDEX idx_debt_assignments_group_id ON debt_assignments(group_id),
    INDEX idx_debt_assignments_assignee ON debt_assignments(assignee_user_id),
    INDEX idx_debt_assignments_status ON debt_assignments(status)
);
```

**Giải thích:**

- `group_id`: Group mà debt assignment này áp dụng
- `assignee_user_id`: Người được gán nợ (sẽ nhận tiền từ người âm và trả cho người dư)
- `assigned_by_user_id`: Người thực hiện gán nợ (chỉ owner)
- `status`: - `active`: Đang áp dụng - `inactive`: Đã bị vô hiệu hóa (khi owner thay đổi) - `pending`: Đang chờ duyệt (khi thành viên đề xuất)
- `reason`: Lý do gán nợ (optional, có thể dùng để giải thích)

**Constraint quan trọng:**

- Chỉ có một `active` assignment cho mỗi group tại một thời điểm
- Khi owner gán nợ mới, assignment cũ sẽ được set `inactive`

### 2.2 Bảng `debt_assignment_requests`

Lưu trữ các đề xuất gán nợ từ thành viên.

```sql
CREATE TABLE debt_assignment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    requested_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposed_assignee_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT, -- Lý do đề xuất
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT, -- Ghi chú khi duyệt/từ chối

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Indexes
    INDEX idx_debt_assignment_requests_group ON debt_assignment_requests(group_id),
    INDEX idx_debt_assignment_requests_requester ON debt_assignment_requests(requested_by_user_id),
    INDEX idx_debt_assignment_requests_status ON debt_assignment_requests(status),
    INDEX idx_debt_assignment_requests_pending ON debt_assignment_requests(group_id, status)
        WHERE status = 'pending'
);
```

**Giải thích:**

- `requested_by_user_id`: Thành viên gửi đề xuất
- `proposed_assignee_user_id`: Người được đề xuất làm debt assignee
- `status`: - `pending`: Chờ owner duyệt - `approved`: Đã được duyệt (sẽ tạo `debt_assignment`) - `rejected`: Bị từ chối
- `reviewed_by_user_id`: Owner đã duyệt/từ chối
- `review_notes`: Ghi chú của owner khi duyệt/từ chối

### 2.3 Bảng `debt_transactions` (Mới)

Lưu trữ các khoản nợ được tính toán dựa trên debt assignment. Bảng này sẽ được tạo lại mỗi khi debt assignment thay đổi.

```sql
CREATE TABLE debt_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    debt_assignment_id UUID REFERENCES debt_assignments(id) ON DELETE SET NULL,

    -- Debt flow
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),

    -- Metadata
    calculation_method TEXT NOT NULL DEFAULT 'equal_split'
        CHECK (calculation_method IN ('equal_split', 'debt_assignment')),
    is_settled BOOLEAN NOT NULL DEFAULT FALSE,
    settled_at TIMESTAMPTZ,
    settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Indexes
    INDEX idx_debt_transactions_group ON debt_transactions(group_id),
    INDEX idx_debt_transactions_assignment ON debt_transactions(debt_assignment_id),
    INDEX idx_debt_transactions_from_user ON debt_transactions(from_user_id),
    INDEX idx_debt_transactions_to_user ON debt_transactions(to_user_id),
    INDEX idx_debt_transactions_settled ON debt_transactions(is_settled),
    INDEX idx_debt_transactions_group_unsettled ON debt_transactions(group_id, is_settled)
        WHERE is_settled = FALSE
);
```

**Giải thích:**

- `debt_assignment_id`: Liên kết với debt assignment đã tạo ra transaction này
- `from_user_id`: Người nợ
- `to_user_id`: Người được trả
- `amount`: Số tiền nợ
- `calculation_method`: - `equal_split`: Chia đều (mặc định) - `debt_assignment`: Tính theo debt assignment
- `is_settled`: Đã được thanh toán chưa
- `settlement_id`: Liên kết với settlement khi được thanh toán

**Lưu ý quan trọng:**

- Khi debt assignment thay đổi, các `debt_transactions` cũ sẽ được đánh dấu `is_settled = TRUE` (nếu chưa settled) và tạo các transactions mới
- Hoặc có thể xóa các transactions cũ và tạo mới (tùy business logic)

### 2.4 Cập nhật Bảng `groups`

Thêm field để track debt assignment status:

```sql
ALTER TABLE groups
ADD COLUMN has_debt_assignment BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN debt_assignment_enabled BOOLEAN NOT NULL DEFAULT TRUE; -- Owner có thể enable/disable tính năng

CREATE INDEX idx_groups_debt_assignment ON groups(has_debt_assignment);
```

### 2.5 Relationship Diagram

```
groups
  ├── debt_assignments (1:many, chỉ 1 active)
  │     └── debt_transactions (1:many)
  │
  └── debt_assignment_requests (1:many)
        └── (khi approved) → tạo debt_assignment mới
```

## 3. Logic Tính Toán Nợ với Debt Assignment

### 3.1 Algorithm: Tính Nợ với Debt Assignee

```typescript
/**
 * Tính toán các khoản nợ dựa trên debt assignment
 *
 * Flow:
 * 1. Tính balance cho mỗi member (như cũ)
 * 2. Nếu có debt assignment:
 *    - Người âm tiền → Trả cho Debt Assignee
 *    - Debt Assignee → Trả cho người dư tiền
 * 3. Nếu không có debt assignment:
 *    - Sử dụng optimized debt calculation (như hiện tại)
 */
function calculateDebtsWithAssignment(
  balances: Record<string, number>,
  assigneeUserId: string | null
): Debt[] {
  if (!assigneeUserId) {
    // Không có assignment, dùng algorithm cũ
    return assignDebtsOptimized(balances);
  }

  const debts: Debt[] = [];
  const assigneeBalance = balances[assigneeUserId] || 0;

  // Nhóm người âm tiền (debtors) và người dư tiền (creditors)
  const debtors: { userId: string; balance: number }[] = [];
  const creditors: { userId: string; balance: number }[] = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    if (userId === assigneeUserId) return; // Skip assignee

    if (balance < -0.01) {
      // Người âm tiền
      debtors.push({ userId, balance });
    } else if (balance > 0.01) {
      // Người dư tiền
```
