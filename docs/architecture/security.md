# Security Model

## Authentication

- **Mechanism**: JWT (JSON Web Tokens).
- **Flow**:
    1. User logs in via Supabase Auth (Email/Password or OAuth).
    2. Access Token & Refresh Token are received.
    3. Tokens should be stored in secure storage (e.g., `expo-secure-store`). *Note: Current implementation may use AsyncStorage during development, but migration to SecureStore is critical for production.*
    4. Token attached to all API/DB requests via `Authorization` header.

## Authorization (RBAC)

Authorization is implemented at the database layer using PostgreSQL Row Level Security (RLS). This ensures that even if the API layer is bypassed, data remains secure.

### Roles
- `owner`: Full access to group. Can delete group.
- `admin`: Can edit settings and manage members.
- `member`: Read/Write expenses.

### RLS Policy Strategies

All tables **MUST** have RLS enabled.

```sql
-- Example RLS Policy Concept for 'expenses' table
CREATE POLICY "Members can view group expenses"
ON expenses
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM group_members WHERE group_id = expenses.group_id
  )
);
```

## Data Protection

- **Encryption in Transit**: TLS 1.2+ is enforced for all connections to Supabase.
- **Encryption at Rest**: Supabase manages encryption for the database volume.
- **Sensitive Data**: Avoid storing PII (Personally Identifiable Information) in plain text columns. Rely on the Auth provider or encrypt fields if absolutely necessary.
