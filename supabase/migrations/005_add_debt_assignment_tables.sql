-- Create debt_assignments table
CREATE TABLE IF NOT EXISTS debt_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    assignee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by_user_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,

    CONSTRAINT unique_active_assignment_per_group
        EXCLUDE (group_id WITH =) WHERE (status = 'active')
);

CREATE INDEX IF NOT EXISTS idx_debt_assignments_group ON debt_assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_debt_assignments_status ON debt_assignments(status);

-- Create debt_assignment_requests table
CREATE TABLE IF NOT EXISTS debt_assignment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    requested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposed_assignee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by_user_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debt_assignment_requests_group ON debt_assignment_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_debt_assignment_requests_status ON debt_assignment_requests(status);

-- Alter groups table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'has_debt_assignment') THEN
        ALTER TABLE groups ADD COLUMN has_debt_assignment BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'debt_assignment_enabled') THEN
        ALTER TABLE groups ADD COLUMN debt_assignment_enabled BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;
