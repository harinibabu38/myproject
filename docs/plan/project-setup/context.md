# Feature Context: Project Setup

## 1. Overview & Description

- **Ticket / Task**: Task 1: Project Setup (from `task.md`)
- **Description**: Initial setup and foundational configuration of the NestJS backend application for the AI-Enabled SaaS Subscription & Analytics Platform.
- **Objective**: Establish a production-ready NestJS application structure integrated with environment variable configuration (`@nestjs/config`), PostgreSQL database connection, and TypeORM ORM setup to support subsequent subscription, invoice, email, background queue, and MCP modules.

## 2. Acceptance Criteria

- [x] Create NestJS application
- [x] Configure environment variables
- [x] Configure PostgreSQL
- [x] Configure TypeORM
- [x] Create initial project structure

## 3. Technical & Architectural Context

- **Impacted Modules**: 
  - Core `AppModule` (`src/app.module.ts`)
  - Global `ConfigModule` (`@nestjs/config`)
  - Global `TypeOrmModule` (`@nestjs/typeorm`)
- **Database / Schema**: 
  - PostgreSQL 16+ engine connection
  - TypeORM async database module configuration (`TypeOrmModule.forRootAsync`)
  - Synchronize option enabled for dev (`auto-load entities: true`)
- **APIs & Webhooks**: 
  - Application startup on default port `3000` (or `PORT` from `.env`)
  - Basic health check endpoint (`GET /`)
- **Background Jobs & Services**: 
  - Environment variable schema support for future Redis/BullMQ and Mailtrap connections

## 4. Dependencies & Prerequisites

- **Prerequisites**: 
  - Node.js (v18+) & npm installed
  - PostgreSQL instance running locally or via Docker container
- **External Dependencies**: 
  - `@nestjs/config`
  - `@nestjs/typeorm`
  - `typeorm`
  - `pg`
  - `dotenv` / `class-validator` / `class-transformer`

## 5. Implementation Notes & Constraints

- Ensure environment variables are strictly parsed via `ConfigService` rather than accessing `process.env` directly.
- Maintain a clean module directory organization under `src/`:
  - `src/config/` for database and app configs
  - `src/modules/` for domain modules (subscriptions, invoices, mail, metrics, mcp)
  - `src/common/` for shared guards, interceptors, and filters
- Keep secrets safe by adding `.env` to `.gitignore` and providing a complete `.env.example`.

## 6. Definition of Done

- [x] All code implemented and passing type checks (`npm run build`)
- [x] Functional flow verified with tests or manual testing (`npm run start:dev`)
- [x] Related documentation (`task.md`, project context) updated
