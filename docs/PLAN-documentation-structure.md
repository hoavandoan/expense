# Project Plan: Documentation Structure

**Goal**: Establish a comprehensive, manually maintained documentation structure for the SplitSmart (Expense) project, migrating existing infrastructure notes and expanding on operational guides.

**Status**: PLANNING
**Scope**: Private/Internal Team
**Automation**: None (Manual Markdown)

## Phase 1: Structure Scaffolding
- [ ] Create directory structure:
    ```
    docs/
    ├── architecture/      # System design
    ├── runbooks/         # Operational procedures (Private)
    ├── dev/              # Developer guides
    └── adr/              # Architecture Decision Records
    ```
- [ ] Create root `docs/README.md` index.

## Phase 2: Content Migration & Expansion
- [ ] **Architecture**:
    - [ ] Migrate `INFRASTRUCTURE.md` (C4 & Container) → `docs/architecture/overview.md`
    - [ ] Extract Data Flow diagrams → `docs/architecture/data-flow.md`
    - [ ] Extract Security Model → `docs/architecture/security.md`
    - [ ] Delete root `INFRASTRUCTURE.md` after verification.
- [ ] **Developer Guides**:
    - [ ] Create `docs/dev/setup.md` (Local env setup)
    - [ ] Create `docs/dev/conventions.md` (Coding standards from Serena memory)
- [ ] **Runbooks** (Private):
    - [ ] Create `docs/runbooks/deployment.md` (EAS/Supabase deploy steps)
    - [ ] Create `docs/runbooks/db-troubleshooting.md` (Common Supabase issues)

## Phase 3: Verification
- [ ] Verify all Mermaid diagrams render correctly.
- [ ] Check all relative links between documents.
- [ ] Verify content covers all "Private" security aspects safely.

## Agent Assignments
- **Tech Writer**: Structure and Content Authoring
- **Architect**: Verification of diagram accuracy

## Key Constraints
- All content written manually in Markdown.
- No auto-generation tools to be configured.
