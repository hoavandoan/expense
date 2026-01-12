-- PostgreSQL functions for balance calculation and statistics

-- Function to calculate user balance in a group
-- Returns: balance (positive = owed money, negative = owes money)
CREATE OR REPLACE FUNCTION calculate_user_balance_in_group(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_total_paid NUMERIC := 0;
  v_total_owed NUMERIC := 0;
BEGIN
  -- Calculate total amount user has paid
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM expenses
  WHERE group_id = p_group_id
    AND paid_by = p_user_id;

  -- Calculate total amount user owes from splits
  SELECT COALESCE(SUM(es.amount), 0) INTO v_total_owed
  FROM expense_splits es
  INNER JOIN expenses e ON e.id = es.expense_id
  WHERE e.group_id = p_group_id
    AND es.user_id = p_user_id;

  RETURN v_total_paid - v_total_owed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate balances for all members in a group
-- Returns: JSONB with user_id as key and balance as value
CREATE OR REPLACE FUNCTION calculate_group_balances(
  p_group_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '{}';
  v_member RECORD;
BEGIN
  FOR v_member IN
    SELECT DISTINCT user_id
    FROM group_members
    WHERE group_id = p_group_id
  LOOP
    v_result := v_result || jsonb_build_object(
      v_member.user_id::text,
      calculate_user_balance_in_group(v_member.user_id, p_group_id)
    );
  END LOOP;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get group statistics
CREATE OR REPLACE FUNCTION get_group_statistics(
  p_group_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_total_expenses NUMERIC;
  v_expense_count INTEGER;
  v_member_count INTEGER;
  v_avg_expense_per_person NUMERIC;
  v_category_stats JSONB;
BEGIN
  -- Total expenses
  SELECT COALESCE(SUM(amount), 0), COUNT(*) INTO v_total_expenses, v_expense_count
  FROM expenses
  WHERE group_id = p_group_id;

  -- Member count
  SELECT COUNT(*) INTO v_member_count
  FROM group_members
  WHERE group_id = p_group_id;

  -- Average expense per person
  IF v_member_count > 0 THEN
    v_avg_expense_per_person := v_total_expenses / v_member_count;
  ELSE
    v_avg_expense_per_person := 0;
  END IF;

  -- Category statistics
  SELECT jsonb_object_agg(category, category_total)
  INTO v_category_stats
  FROM (
    SELECT 
      category,
      SUM(amount) as category_total
    FROM expenses
    WHERE group_id = p_group_id
    GROUP BY category
  ) category_totals;

  RETURN jsonb_build_object(
    'total_expenses', v_total_expenses,
    'expense_count', v_expense_count,
    'member_count', v_member_count,
    'avg_expense_per_person', v_avg_expense_per_person,
    'category_stats', COALESCE(v_category_stats, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's total balance across all groups
CREATE OR REPLACE FUNCTION calculate_user_total_balance(
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_total_owed NUMERIC := 0;  -- Others owe to user
  v_total_owing NUMERIC := 0;  -- User owes to others
  v_group_balance NUMERIC;
  v_group_id UUID;
BEGIN
  FOR v_group_id IN
    SELECT DISTINCT group_id
    FROM group_members
    WHERE user_id = p_user_id
  LOOP
    v_group_balance := calculate_user_balance_in_group(p_user_id, v_group_id);
    
    IF v_group_balance > 0 THEN
      v_total_owed := v_total_owed + v_group_balance;
    ELSE
      v_total_owing := v_total_owing + ABS(v_group_balance);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'total_owed', v_total_owed,
    'total_owing', v_total_owing,
    'net_balance', v_total_owed - v_total_owing
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate expense splits sum equals expense amount
CREATE OR REPLACE FUNCTION validate_expense_splits()
RETURNS TRIGGER AS $$
DECLARE
  v_expense_amount NUMERIC;
  v_splits_total NUMERIC;
BEGIN
  -- Get expense amount
  SELECT amount INTO v_expense_amount
  FROM expenses
  WHERE id = NEW.expense_id;

  -- Calculate total splits for this expense
  SELECT COALESCE(SUM(amount), 0) INTO v_splits_total
  FROM expense_splits
  WHERE expense_id = NEW.expense_id;

  -- Check if splits total matches expense amount (allow small rounding differences)
  IF ABS(v_splits_total - v_expense_amount) > 0.01 THEN
    RAISE EXCEPTION 'Expense splits total (%) does not match expense amount (%)', 
      v_splits_total, v_expense_amount;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate expense splits
DROP TRIGGER IF EXISTS validate_expense_splits_trigger ON expense_splits;
CREATE TRIGGER validate_expense_splits_trigger
  AFTER INSERT OR UPDATE ON expense_splits
  FOR EACH ROW
  EXECUTE FUNCTION validate_expense_splits();

-- Function to auto-update groups.updated_at when expense is created/updated/deleted
CREATE OR REPLACE FUNCTION update_group_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE groups
    SET updated_at = NOW()
    WHERE id = OLD.group_id;
    RETURN OLD;
  ELSE
    UPDATE groups
    SET updated_at = NOW()
    WHERE id = NEW.group_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update groups.updated_at
DROP TRIGGER IF EXISTS update_group_updated_at_trigger ON expenses;
CREATE TRIGGER update_group_updated_at_trigger
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_group_updated_at();
