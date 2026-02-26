---
description: Add or update features in existing application. Used for iterative development.
---

# /enhance - Update Application

$ARGUMENTS

---

## Task

This command adds features or makes updates to existing application.

### Steps:

1. **Load Guards & Context**
   - Read `.agent/guards/before-code.md` — verify coding standards loaded
   - If UI changes involved: also read `.agent/guards/before-ui.md`
   - Read `.agent/context/architecture.md` — understand current architecture
   - Read `.agent/context/app-flow.md` — understand current screen map
   - Read `.agent/context/decisions.md` — check for relevant ADRs

2. **Understand Current State**
   - Read relevant files using Serena semantic tools (find_symbol, get_symbols_overview)
   - Check `lib/types/index.ts` for relevant data models
   - Check `lib/hooks/` for existing query/mutation hooks

3. **Plan Changes**
   - Determine what will be added/changed
   - Detect affected files
   - Check dependencies
   - Verify plan doesn't violate any ADRs in `decisions.md`

4. **Present Plan to User** (for major changes)
   ```
   "To add [feature]:
   - I'll create X new files
   - Update Y files
   - Estimated effort: ~Z minutes

   Should I start?"
   ```

5. **Apply**
   - Follow coding standards from `02-coding-standards.md`
   - Follow UI patterns from `03-ui-ux-patterns.md` if touching UI
   - Make changes file by file
   - Test

6. **Verify Against Guards**
   - Re-check `before-code.md` checklist
   - Re-check `before-ui.md` checklist if UI changed
   - Ensure all imports use `@/` alias
   - Ensure no prohibited patterns introduced

---

## Usage Examples

```
/enhance add dark mode
/enhance build admin panel
/enhance integrate payment system
/enhance add search feature
/enhance edit profile page
```

---

## Caution

- Get approval for major changes
- Warn on conflicting requests (e.g., "use Firebase" when project uses Supabase)
- Follow guard checklists strictly
