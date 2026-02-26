# Operations & Deployment — Living Context

> This file documents operational procedures, deployment steps, and troubleshooting.
> Update when changing CI/CD pipelines or discovering recurring DB issues.

## Deployment (Expo / EAS)

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Logged into Expo: `eas login`

### 1. Production Build (Store Release)
1.  **Bump Version**: Update `version` in `app.json`.
2.  **Run Build**: `eas build --profile production --platform all`
3.  **Submit**:
    - **iOS**: Use Transporter app or `eas submit`.
    - **Android**: Upload AAB to Google Play Console.

### 2. Over-the-Air Update (Hotfix)
For JS-only changes:
```bash
eas update --branch production --message "Fix: description"
```

## Backend Operations (Supabase)

### Database Migrations
1.  **Local**: `supabase migration new <name>` -> Write SQL -> `supabase db reset`
2.  **Production**: Push via GitHub Actions or apply manually in Supabase SQL Editor.

### Common Troubleshooting

#### High Latency / Slow Queries
Diagnostic Query:
```sql
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '10 seconds';
```

#### Connection Exhaustion
Check Active Connections:
```sql
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
```
*Resolution*: Use Transaction Pooler (port 6543) for serverless environments.

#### RLS Policy Errors
- Verify `auth.uid()` matches the owner column.
- Check if RLS is enabled on the table.
