CREATE OR REPLACE FUNCTION get_group_spending_stats(p_group_id UUID)
RETURNS JSON AS $$
DECLARE
  v_total_amount NUMERIC;
  v_member_count INTEGER;
  v_category_stats JSON;
BEGIN
  -- Calculate total amount
  SELECT COALESCE(SUM(amount), 0) INTO v_total_amount
  FROM expenses
  WHERE group_id = p_group_id;

  -- Count members
  SELECT COUNT(*) INTO v_member_count
  FROM group_members
  WHERE group_id = p_group_id;

  -- Calculate category stats
  SELECT json_agg(stats) INTO v_category_stats
  FROM (
    SELECT 
      category, 
      SUM(amount) as amount
    FROM expenses
    WHERE group_id = p_group_id
    GROUP BY category
  ) stats;

  RETURN json_build_object(
    'totalAmount', v_total_amount,
    'memberCount', v_member_count,
    'categoryStats', COALESCE(v_category_stats, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql;
