# Database Troubleshooting (Supabase)

## Common Issues

### 1. High Latency / Slow Queries
Check for long-running queries in the **Supabase Dashboard > Database > Postgres Logs**.

**Diagnostic Query:**
```sql
SELECT
  pid,
  now() - query_start AS duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '10 seconds';
```

### 2. Connection Exhaustion
If the app reports "Too many connections", check the connection pool.

**Check Active Connections:**
```sql
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
```

**Resolution**:
- Use the Transaction Pooler (port 6543) instead of Session Pooler (port 5432) for serverless environments.
- Kill idle connections if strictly necessary:
  ```sql
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle' AND query_start < now() - interval '1 hour';
  ```

### 3. RLS Policy Errors
If users cannot see data they created:
- Verify `auth.uid()` matches the `user_id` column.
- Check if the table has RLS enabled (`ALTER TABLE x ENABLE ROW LEVEL SECURITY;`).
