# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with tsx watch
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run production server from dist folder
- `npm run check` - Type check without emitting files
- `npm run test` - Run all tests with Vitest
- `npm run seed-db` - Seed the main database with test data
- `npm run seed-test-db` - Seed the test database with test data
- `npm run drop-test-db` - Drop the test database

## Architecture Overview

This is a TypeScript backend for a kanban board application built with:

### Core Stack

- **Hono** - Web framework serving as the HTTP server
- **tRPC** - Type-safe API layer exposed at `/api/trpc/*`
- **Drizzle ORM** - TypeScript ORM with PostgreSQL adapter
- **Better Auth** - Authentication system with Google/GitHub providers
- **PostgreSQL** - Database with Drizzle schema
- **Zod** - Runtime validation and schema definition
- **Vitest** - Testing framework

### Key Architecture Patterns

**tRPC Integration**: The application uses tRPC for type-safe APIs. The main router is in `src/main/trpc/appRouter.ts` and routes are organized by domain (`tasks` and `boards`).

**Database Layer**: Migrated from pgtyped to Drizzle ORM using a schema-first approach. Schema defined in `src/main/db/schema.ts` with models in `src/main/models/` for business logic.

**Authentication**: Uses Better Auth with social providers (Google/GitHub). Auth configuration in `src/main/util/auth.ts` with database adapter integration.

**Cursor-Based Pagination**: Implements cursor-based pagination for task lists with support for sorting by creation date or due date. Pagination logic in `src/main/util/Pagination.ts`.

**Error Handling**: Uses tRPC error handling with `TRPCError` for consistent API responses. Custom response wrappers in `src/main/util/responseWrappers.ts`.

## Database Setup

- Main database: Configured via `DB_URL` environment variable
- Test database: Configured via `DB_URL_TEST` environment variable
- Environment controlled by `DB_PROD` environment variable
- Drizzle configuration in `drizzle.config.ts`
- Database connection in `src/main/db/index.ts` with schema import
- Seed file: `seed_db.sql` (Note: needs updating for new schema structure)

## Schema Structure

### Tables

- **users** - User accounts with Better Auth integration
- **session** - User sessions for authentication
- **account** - Social provider accounts
- **verification** - Email verification tokens
- **boards** - Kanban boards belonging to users
- **tasks** - Tasks within boards with status enum (TODO, IN_PROGRESS, DONE)

### Key Relationships

- Users can have multiple boards (one-to-many)
- Boards can have multiple tasks (one-to-many)
- Cascading deletes for user -> boards -> tasks

## Models

### Task Model (`src/main/models/Task.ts`)

- CRUD operations using Drizzle ORM
- Pagination support with multiple sort strategies
- Methods: `getAllFromBoard`, `getNumTasks`, `getTasksByCreated`, `getTasksByDueDate`, `findById`, `updateStatus`, `delete`, `create`

### Board Model (`src/main/models/Board.ts`)

- Basic CRUD operations for boards
- Methods: `create`, `updateName`, `delete`

### Auth Model (`src/main/models/Auth.ts`)

- Authorization helpers
- Methods: `verifyBoardOwnership`

## API Structure

### Tasks Router (`/api/trpc/tasks`)

- `getAllFromBoard` - Get all tasks for a board
- `getCount` - Get task count for a board
- Pagination endpoints for tasks by creation date and due date
- CRUD operations with proper ownership verification

### Boards Router (`/api/trpc/boards`)

- `create` - Create new board
- `updateName` - Update board title
- `delete` - Delete board (cascades to tasks)

## Project Structure

- `src/main/` - Application code
  - `index.ts` - Server entry point with Hono and tRPC setup
  - `db/` - Database configuration and Drizzle schema
  - `trpc/` - tRPC configuration and routers
  - `routes/` - Domain-specific tRPC routers and validation schemas
  - `models/` - Business logic models using Drizzle ORM
  - `util/` - Shared utilities (auth, pagination, response wrappers, types)
- `src/test/` - Test suites organized by type
