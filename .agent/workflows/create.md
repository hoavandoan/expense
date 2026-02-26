---
description: Create new application command. Triggers App Builder skill and starts interactive dialogue with user.
---

# /create - Create Application

$ARGUMENTS

---

## Task

This command starts a new application creation process.

### Steps:

1. **Load Guards & Context**
   - Read `.agent/guards/before-code.md` — verify coding standards loaded
   - If UI changes involved: also read `.agent/guards/before-ui.md`
   - Read `.agent/context/architecture.md` — understand current architecture
   - Read `.agent/context/app-flow.md` — understand current screen map
   - Read `.agent/context/decisions.md` — check for relevant ADRs

2. **Request Analysis**
   - Understand what the user wants
   - If information is missing, use `conversation-manager` skill to ask

3. **Project Planning**
   - Use `project-planner` agent for task breakdown
   - Determine tech stack (follow `01-project-identity.md`)
   - Plan file structure
   - Create plan file and proceed to building

4. **Application Building (After Approval)**
   - Follow `02-coding-standards.md` and `03-ui-ux-patterns.md` strictly
   - Coordinate expert agents:
     - `mobile-developer` → UI & Logic
     - `debugger` → Error handling
     - `test-engineer` → Verification

5. **Verify Against Guards**
   - Re-check `before-code.md` checklist
   - Re-check `before-ui.md` checklist if UI created
   - Ensure all imports use `@/` alias


---

## Usage Examples

```
/create blog site
/create e-commerce app with product listing and cart
/create todo app
/create Instagram clone
/create crm system with customer management
```

---

## Before Starting

If request is unclear, ask these questions:
- What type of application?
- What are the basic features?
- Who will use it?

Use defaults, add details later.
