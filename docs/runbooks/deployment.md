# Deployment Runbook

## Mobile App Release (Expo / EAS)

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Logged into Expo: `eas login`

### 1. Production Build (Store Release)

1.  **Bump Version**: Update `version` in `app.json`.
2.  **Run Build**:
    ```bash
    eas build --profile production --platform all
    ```
3.  **Submit**:
    - **iOS**: Use Transporter app or `eas submit`.
    - **Android**: Upload AAB to Google Play Console.

### 2. Over-the-Air Update (Hotfix)

For JS-only changes (no native module changes):

```bash
eas update --branch production --message "Fix: login crash"
```

## Backend Changes

### Database Migrations
1.  **Local**:
    ```bash
    supabase migration new <name>
    # Write SQL in the generated file
    supabase db reset # Apply locally
    ```
2.  **Production**:
    - Push changes via GitHub Actions (if configured) OR
    - Manually apply SQL via Supabase Dashboard SQL Editor (Emergency only).

### Environment Variables
- Manage production secrets in the **EAS Dashboard** (for app) and **Supabase Dashboard** (for edge functions).
