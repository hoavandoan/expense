-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action_type CHECK (
    action_type IN (
      'expense_created',
      'expense_updated',
      'expense_deleted',
      'settlement_created',
      'settlement_completed',
      'settlement_rejected',
      'group_member_added',
      'group_member_removed',
      'group_member_role_changed',
      'group_updated',
      'debt_assignment_created',
      'debt_assignment_updated'
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_activity_log_group_id ON activity_log(group_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(group_id, created_at DESC);
CREATE INDEX idx_activity_log_action_type ON activity_log(action_type);

-- Enable Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view activities from groups they are members of
CREATE POLICY "Users can view activities from their groups"
  ON activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = activity_log.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Function to create activity log entry
CREATE OR REPLACE FUNCTION create_activity_log(
  p_group_id UUID,
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_log (group_id, user_id, action_type, metadata)
  VALUES (p_group_id, p_user_id, p_action_type, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log expense creation
CREATE OR REPLACE FUNCTION log_expense_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_activity_log(
    NEW.group_id,
    NEW.paid_by,
    'expense_created',
    jsonb_build_object(
      'expense_id', NEW.id,
      'amount', NEW.amount,
      'title', NEW.title
    )
  );
  
  -- Create notifications for group members (except the payer)
  PERFORM create_notification(
    gm.user_id,
    'expense_created',
    'Chi tiêu mới: ' || NEW.title,
    NEW.description,
    jsonb_build_object(
      'expense_id', NEW.id,
      'group_id', NEW.group_id,
      'paid_by', NEW.paid_by
    )
  )
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id
  AND gm.user_id != NEW.paid_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_created_activity_trigger
  AFTER INSERT ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION log_expense_created();

-- Trigger to log settlement creation
CREATE OR REPLACE FUNCTION log_settlement_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_activity_log(
    NEW.group_id,
    NEW.from_user_id,
    'settlement_created',
    jsonb_build_object(
      'settlement_id', NEW.id,
      'amount', NEW.amount,
      'to_user_id', NEW.to_user_id
    )
  );
  
  -- Create notification for the receiver
  PERFORM create_notification(
    NEW.to_user_id,
    'settlement_requested',
    'Yêu cầu thanh toán',
    'Bạn có yêu cầu thanh toán mới',
    jsonb_build_object(
      'settlement_id', NEW.id,
      'group_id', NEW.group_id,
      'from_user_id', NEW.from_user_id,
      'amount', NEW.amount
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settlement_created_activity_trigger
  AFTER INSERT ON settlements
  FOR EACH ROW
  EXECUTE FUNCTION log_settlement_created();

-- Trigger to log settlement completion
CREATE OR REPLACE FUNCTION log_settlement_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM create_activity_log(
      NEW.group_id,
      NEW.from_user_id,
      'settlement_completed',
      jsonb_build_object(
        'settlement_id', NEW.id,
        'amount', NEW.amount,
        'to_user_id', NEW.to_user_id
      )
    );
    
    -- Create notification for the payer
    PERFORM create_notification(
      NEW.from_user_id,
      'settlement_completed',
      'Thanh toán đã hoàn tất',
      'Khoản thanh toán của bạn đã được xác nhận',
      jsonb_build_object(
        'settlement_id', NEW.id,
        'group_id', NEW.group_id,
        'amount', NEW.amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settlement_completed_activity_trigger
  AFTER UPDATE ON settlements
  FOR EACH ROW
  EXECUTE FUNCTION log_settlement_completed();

-- Trigger to log group member addition
CREATE OR REPLACE FUNCTION log_group_member_added()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_activity_log(
    NEW.group_id,
    NEW.user_id,
    'group_member_added',
    jsonb_build_object(
      'member_id', NEW.user_id,
      'role', NEW.role
    )
  );
  
  -- Create notification for the new member
  PERFORM create_notification(
    NEW.user_id,
    'group_member_added',
    'Bạn đã được thêm vào nhóm',
    'Bạn đã được thêm vào một nhóm mới',
    jsonb_build_object(
      'group_id', NEW.group_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_member_added_activity_trigger
  AFTER INSERT ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION log_group_member_added();
