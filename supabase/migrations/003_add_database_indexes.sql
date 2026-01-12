-- Add indexes for performance optimization

-- Indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_group_id_created_at ON expenses(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id_expense_date ON expenses(group_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Indexes for expense_splits table
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_user ON expense_splits(expense_id, user_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_is_paid ON expense_splits(is_paid) WHERE is_paid = false;

-- Indexes for group_members table
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- Indexes for groups table
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code) WHERE invite_code IS NOT NULL;

-- Indexes for settlements table
CREATE INDEX IF NOT EXISTS idx_settlements_group_id ON settlements(group_id);
CREATE INDEX IF NOT EXISTS idx_settlements_from_user_id ON settlements(from_user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_to_user_id ON settlements(to_user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_group_status ON settlements(group_id, status) WHERE status = 'pending';

-- Add check constraints for data integrity
ALTER TABLE expenses ADD CONSTRAINT check_expense_amount_positive CHECK (amount > 0);
ALTER TABLE expense_splits ADD CONSTRAINT check_split_amount_positive CHECK (amount > 0);
ALTER TABLE settlements ADD CONSTRAINT check_settlement_amount_positive CHECK (amount > 0);
