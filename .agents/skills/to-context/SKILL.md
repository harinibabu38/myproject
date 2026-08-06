---
name: to-context
description: Extract ticket details from task.md and create a feature context file at docs/plan/{Name of the feature}/context.md with description, acceptance criteria, and technical context.
disable-model-invocation: true
---

# To Context

Extract ticket details from `task.md` and generate a structured `context.md` file in `docs/plan/{Name of the feature}/`.

## Process

### 1. Locate task.md and select ticket

Locate `task.md` in the project root (or search the repository if located elsewhere).

- If the user provides a ticket name, number, or keyword as an argument (e.g. `/to-context "Invoice Generation"`), extract that ticket section.
- If no ticket argument is provided, inspect `task.md` for active or uncompleted tickets (`- [ ]`) and prompt the user to confirm which ticket to process.

**Completion criterion:** The target ticket title, checklist items, and scope are identified from `task.md`.

### 2. Determine feature name and directory path

1. Derive the feature name from the ticket title.
2. Format the feature name for the directory path (e.g., "Invoice Generation & Storage" -> `Invoice Generation` or `invoice-generation`).
3. Set the target path to `docs/plan/{Name of the feature}/context.md` (or `src/docs/plan/{Name of the feature}/context.md` if the project uses a `src/` documentation layout).

**Completion criterion:** Target directory path `docs/plan/{Name of the feature}/` is established.

### 3. Extract and synthesize ticket details

Synthesize the following sections from `task.md`, existing project docs, and codebase context:

1. **Overview & Description**: What the feature is, the problem it solves, and why it is needed.
2. **Acceptance Criteria**: Formatted as a markdown checkbox list (`- [ ]`).
3. **Technical & Architectural Context**: Affected modules, database entities, APIs, background jobs, or third-party integrations (e.g., Stripe, Redis, BullMQ, MCP).
4. **Dependencies & Blockers**: Prerequisite tickets, environment configuration, or setup steps.
5. **Definition of Done**: Verification criteria required to consider the ticket finished.

**Completion criterion:** All core detail sections are drafted with specific project facts (no generic placeholders).

### 4. Create docs/plan/{Name of the feature}/context.md

Create the feature directory if it does not exist, and write `context.md` using the template below.

**Completion criterion:** The file `docs/plan/{Name of the feature}/context.md` is created and populated.

<context-template>

# Feature Context: {Feature Name}

## 1. Overview & Description

- **Ticket / Task**: {Ticket Name / Section Number}
- **Description**: {Clear description of the feature to be built}
- **Objective**: {The core goal and value delivered by this ticket}

## 2. Acceptance Criteria

- [ ] {Acceptance criterion 1}
- [ ] {Acceptance criterion 2}
- [ ] {Acceptance criterion 3}

## 3. Technical & Architectural Context

- **Impacted Modules**: {List of NestJS/backend/frontend modules affected}
- **Database / Schema**: {Relevant entities, tables, or fields}
- **APIs & Webhooks**: {Endpoints or webhook handlers to create/modify}
- **Background Jobs & Services**: {Redis/BullMQ queues, cron jobs, external services}

## 4. Dependencies & Prerequisites

- **Prerequisites**: {Earlier tasks or setup required before starting}
- **External Dependencies**: {Services like Stripe, Mailtrap, Redis, etc.}

## 5. Implementation Notes & Constraints

- {Key architectural rules, security constraints, or design choices}

## 6. Definition of Done

- [ ] All code implemented and passing type checks
- [ ] Functional flow verified with tests or manual testing
- [ ] Related documentation (`task.md`, project context) updated

</context-template>
