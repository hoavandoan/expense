-- Add created_by column to expenses table to track who created the expense
-- This allows distinguishing between the payer and the creator (for edit permissions)

-- Add created_by column
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Set existing expenses created_by to paid_by as a fallback
UPDATE expenses SET created_by = paid_by WHERE created_by IS NULL;

-- Make created_by NOT NULL after backfilling
ALTER TABLE expenses ALTER COLUMN created_by SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);

-- Add comment for documentation
COMMENT ON COLUMN expenses.created_by IS 'The user who created this expense (may differ from payer)';
