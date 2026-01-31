# Security Guidelines

## 1. Database Security (RLS)

Row Level Security is the primary defense. **Never disable RLS** on public tables.

### Best Practices
1.  **Helper Functions**: Use PostgreSQL functions to wrap complex logic (e.g., `is_group_member(group_id)`).
    ```sql
    create or replace function is_group_member(_group_id uuid)
    returns boolean as $$
    select exists (
      select 1 from group_members
      where group_id = _group_id
      and user_id = auth.uid()
    );
    $$ language sql security definer;
    ```
2.  **Policies**:
    - **Select**: Allow if `is_group_member`.
    - **Insert**: Allow if `auth.uid()` matches `paid_by` (for expenses).
    - **Update/Delete**: Allow if `auth.uid()` matches `paid_by` OR user is `admin`.

## 2. Authentication Flow

### Session Handling
- **Persist Session**: Sessions are persisted securely.
- **Refresh Token**: Supabase SDK handles rotation automatically.
- **Logout**: Call `supabase.auth.signOut()` to invalidate session on server.

### Protecting Routes
- Use `useAuth` hook or `(protected)` route group layout to redirect unauthenticated users to the Login screen immediately.

## 3. Storage Security
- **Buckets**:
    - `avatars`: Public read, Authenticated write (own folder only).
    - `receipts`: Authenticated read (group members only), Authenticated write.
- **Policies**: Apply RLS-equivalent policies to Storage Buckets via Supabase Dashboard.
